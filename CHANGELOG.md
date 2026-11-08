# Changelog

All notable changes to this project are listed here.
Versions follow [Semantic Versioning](https://semver.org): MAJOR.MINOR.PATCH.

## [1.0.0] - 2026-11-07

First release.

### Features
- Roll any mix of d4, d6, d8, d10, d12, d20 and d% (up to 20 dice at once).
- Click a die to add it; click its badge or right-click to remove one. The selection
  resets after each roll.
- Dice are thrown onto a velvet-lined dice tray, tumble through random faces and land on
  their results. A natural 20 or natural 1 on a d20 glows.
- Advantage and disadvantage for d20 rolls: pick the mode in the selection bar, each d20 is
  rolled twice and the higher (advantage) or lower (disadvantage) result is kept. Both dice
  land on the tray and the discarded one fades out. The mode resets after each roll.
- d% is rolled like the physical pair: a tens die (00-90) plus a ones die (0-9).
- Fair rolls made on the server with a cryptographically secure random number generator.
- D&D-themed interface: torch-lit stone, parchment, gold trim and fantasy lettering.
- Respects reduced-motion settings; results are announced to screen readers.

### Running
- Angular 22 + TypeScript front end and Express TypeScript API in one Docker image.
- Roll API with an optional `mode=advantage|disadvantage` parameter.
- Published to `ghcr.io/millermatt090/dnd` for Intel/AMD and ARM.
- `conf/docker-compose-template/dungeon.yaml` runs it with `docker compose -f dungeon.yaml up -d dungeon`
  on http://localhost:8080.

[1.0.0]: https://github.com/millermatt090/dnd/tree/1.0.0
