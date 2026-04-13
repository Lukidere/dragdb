{
  description = "Mój projekt Node.js budowany przez npm";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        # To jest pakiet, który powstanie po wpisaniu `nix build`
        packages.default = pkgs.buildNpmPackage {
          pname = "nazwa-twojego-projektu";
          version = "1.0.0";

          # Źródło to obecny katalog
          src = ./.;

          # Wersja Node.js (zmień na nodejs_18 lub nodejs_22 według potrzeb)
          nodejs = pkgs.nodejs_20;

          # HASH ZALEŻNOŚCI: 
          # Za pierwszym razem zostaw to puste (lib.fakeHash). 
          # Podczas budowania Nix wyrzuci błąd z poprawnym hashem, który musisz tu wkleić.
          npmDepsHash = pkgs.lib.fakeHash;

          # Jeśli twój skrypt budowania to coś innego niż `npm run build`, odkomentuj to:
          # npmBuildScript = "build";

          # To określa, co ostatecznie ląduje w katalogu wynikowym (/nix/store/...).
          # Zazwyczaj frameworki frontendowe plują do "dist/" lub "build/".
          installPhase = ''
            runHook preInstall

            mkdir -p $out
            cp -r dist/* $out/

            runHook postInstall
          '';
        };

        # Środowisko deweloperskie aktywowane przez `nix develop`
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            # npm jest automatycznie dołączony do paczki nodejs
          ];

          shellHook = ''
            echo "Witaj w środowisku deweloperskim Node.js!"
            node --version
            npm --version
          '';
        };
      }
    );
}
