// Copyright (c) Zefchain Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use async_graphql::ComplexObject;
use gol_challenge::{GolChallengeAbi, Operation};
use linera_sdk::linera_base_types::ChainId;
use linera_sdk::{
    linera_base_types::WithContractAbi,
    views::{RootView, View},
    Contract, ContractRuntime,
};
use serde::{Deserialize, Serialize};
use state::ReportedSolution;
use state::{GolChallengeState, Solution};

pub struct GolChallengeContract {
    state: GolChallengeState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(GolChallengeContract);

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Parameters {
    /// Where to report puzzles for scoring. If `None`, don't report puzzles.
    scoring_chain_id: Option<ChainId>,
}

impl WithContractAbi for GolChallengeContract {
    type Abi = GolChallengeAbi;
}

impl Contract for GolChallengeContract {
    type Message = ReportedSolution;
    type InstantiationArgument = ();
    type Parameters = Parameters;
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
        let Operation::SubmitSolution {
            puzzle_id,
            board,
            owner,
        } = operation;
        let owner = owner.unwrap_or_else(|| {
            self.runtime
                .authenticated_signer()
                .expect("Operation must have an owner or be authenticated.")
        });
        let puzzle_bytes = self.runtime.read_data_blob(puzzle_id);
        let puzzle = bcs::from_bytes(&puzzle_bytes).expect("Deserialize puzzle");
        board.check_puzzle(&puzzle).expect("Invalid solution");
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

        if let Parameters {
            scoring_chain_id: Some(chain_id),
        } = self.runtime.application_parameters()
        {
            let solution = ReportedSolution {
                puzzle_id,
                timestamp,
                owner,
            };
            self.runtime.prepare_message(solution).send_to(chain_id);
        }
    }

    async fn execute_message(&mut self, solution: ReportedSolution) {
        log::trace!("Handling message {:?}", solution);
        let Parameters {
            scoring_chain_id: Some(chain_id),
        } = self.runtime.application_parameters()
        else {
            panic!("If we're receiving a message, the scoring chain must exist.")
        };
        assert_eq!(
            self.runtime.chain_id(),
            chain_id,
            "Messages are sent to the scoring chain."
        );
        self.state.reported_solutions.push(solution);
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

/// This implementation is only nonempty in the service.
#[ComplexObject]
impl GolChallengeState {}
