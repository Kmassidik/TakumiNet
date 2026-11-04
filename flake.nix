{
  description = "TakumiNet — clean-room browser network emulator";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forAll = f: nixpkgs.lib.genAttrs systems (s: f nixpkgs.legacyPackages.${s});
    in {
      packages = forAll (pkgs: {
        default = pkgs.rustPlatform.buildRustPackage {
          pname = "pt-web";
          version = "0.1.0";
          src = self;
          cargoLock.lockFile = ./Cargo.lock;
          meta = {
            description = "Browser asset viewer for an asset tree";
            mainProgram = "pt-web";
          };
        };
      });

      apps = forAll (pkgs: {
        default = {
          type = "app";
          program = "${self.packages.${pkgs.system}.default}/bin/pt-web";
        };
      });

      devShells = forAll (pkgs: {
        default = pkgs.mkShell {
          packages = [ pkgs.cargo pkgs.rustc pkgs.rustfmt pkgs.clippy ];
          shellHook = ''
            export PORT=3000
            echo "TakumiNet dev shell — cargo run"
          '';
        };
      });
    };
}
