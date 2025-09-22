// Copyright (c) Zefchain Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use async_graphql::ComplexObject;
use gol_challenge::{game::Puzzle, GolChallengeAbi, Operation};
use linera_sdk::{
    linera_base_types::{AccountOwner, DataBlobHash, Timestamp, WithContractAbi},
    views::{RootView, View},
    Contract, ContractRuntime,
};
use serde::{Deserialize, Serialize};
use state::{GolChallengeState, Solution};

pub struct GolChallengeContract {
    state: GolChallengeState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(GolChallengeContract);

impl WithContractAbi for GolChallengeContract {
    type Abi = GolChallengeAbi;
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    /// The ID of the puzzle that was solved.
    pub puzzle_id: DataBlobHash,
    /// The timestamp of the solution.
    pub timestamp: Timestamp,
    /// The user credited for the solution.
    pub owner: AccountOwner,
}

impl Contract for GolChallengeContract {
    type Message = Message;
    type InstantiationArgument = ();
    type Parameters = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = GolChallengeState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        GolChallengeContract { state, runtime }
    }

    async fn instantiate(&mut self, _arg: ()) {
        log::trace!("Instantiating");
        // Verify that the parameters are correct.
        self.runtime.application_parameters();
    }

    async fn execute_operation(&mut self, operation: Operation) {
        log::trace!("Handling operation {:?}", operation);
        match operation {
            Operation::SubmitSolution {
                puzzle_id,
                board,
                owner,
                scoring_chain_id,
            } => {
                let owner = owner.unwrap_or_else(|| {
                    self.runtime
                        .authenticated_signer()
                        .expect("Operation must have an owner or be authenticated.")
                });
                let puzzle_bytes = self.runtime.read_data_blob(puzzle_id);
                let puzzle = bcs::from_bytes::<Puzzle>(&puzzle_bytes).expect("Deserialize puzzle");
                puzzle.check_solution(&board).expect("Invalid solution");
                let timestamp = self.runtime.system_time();
                let solution = Solution {
                    board,
                    timestamp,
                    owner,
                };
                self.state
                    .solutions
                    .insert(&puzzle_id, solution)
                    .expect("Store solution");

                if let Some(scoring_chain_id) = scoring_chain_id {
                    let message = Message {
                        puzzle_id,
                        timestamp,
                        owner,
                    };
                    self.runtime
                        .prepare_message(message)
                        .send_to(scoring_chain_id);
                }
            }
            Operation::RegisterPuzzle { puzzle_id } => {
                // Puzzles are only registered on a scoring chain.
                self.state.registered_puzzles.insert(&puzzle_id).unwrap();
            }
        }
    }

    async fn execute_message(&mut self, message: Message) {
        log::trace!("Handling message {:?}", message);
        let Message {
            puzzle_id,
            timestamp,
            owner,
        } = message;
        let is_registered = self
            .state
            .registered_puzzles
            .contains(&puzzle_id)
            .await
            .unwrap();
        assert!(is_registered, "Puzzle must be registered");
        let map = self
            .state
            .reported_solutions
            .load_entry_mut(&owner)
            .await
            .unwrap();
        map.insert(&puzzle_id, timestamp).unwrap();
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

/// This implementation is only nonempty in the service.
#[ComplexObject]
impl GolChallengeState {}
