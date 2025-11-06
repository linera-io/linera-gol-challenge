{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";

    # Rust
    rust-overlay.url = "github:oxalica/rust-overlay";
    crane.url = "github:ipetkov/crane";

    # Dev tools
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };

  outputs = inputs: inputs.flake-parts.lib.mkFlake { inherit inputs; } {
    systems = import inputs.systems;
    imports = [
      inputs.treefmt-nix.flakeModule
    ];
    perSystem = { config, self', inputs', pkgs, lib, system, ... }: {
      _module.args.pkgs = import inputs.nixpkgs {
        inherit system;
        overlays = [ (import inputs.rust-overlay) ];
      };

      # Dev environment for the Game of Life challenge
      devShells.default = pkgs.mkShell {
        inputsFrom = [
          config.treefmt.build.devShell
        ];

        buildInputs = with pkgs; [
          # Frontend dependencies
          nodejs
          pnpm

          # Rust toolchain from rust-toolchain.toml
          (rust-bin.fromRustupToolchainFile ./rust-toolchain.toml)

          # Linera dependencies
          pkg-config
          openssl
          protobuf
          clang
          clang.cc.lib
          libiconv

          # Deployment tools
          google-cloud-sdk

          # Development tools
          jq
        ];

        shellHook = ''
          export PATH=$PWD/target/debug:$PATH
          export LIBCLANG_PATH="${pkgs.clang.cc.lib}/lib"
          echo "Game of Life Challenge development environment"
          echo "- Frontend: cd frontend && pnpm install && pnpm build"
          echo "- Backend: cargo build"
        '';
      };

      # Treefmt configuration
      treefmt.config = {
        projectRootFile = "flake.nix";
        programs.nixpkgs-fmt.enable = true;
        programs.rustfmt.enable = true;
        programs.prettier.enable = true;
      };
    };
  };
}
