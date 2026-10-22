# SukhoiBot

A ~460k-parameter policy network that plays chess like **Sukhoi35**, served on the portfolio's
`/chess/` page with pure-TypeScript inference (`src/app/chess/lib/sukhoiNet.ts`).

## Training data rules
- Games that include Sukhoi35 → learn Sukhoi35's moves (whichever color).
- Other games → learn the winner's moves; on a draw, the lower-rated side's moves (both if equal).

## Train on Colab
1. Open `SukhoiBot_Colab.ipynb` in Colab (File → Upload notebook).
2. Runtime → Change runtime type → **T4 GPU**, then Runtime → Run all.
   The PGNs are pulled from the shared Drive folder set in `DRIVE_FOLDER_URL`.
3. The last cell downloads `sukhoi-bot.json` + `sukhoi-bot.bin` — copy them into `public/chess-bot/`.

Knobs (cell 2): `ELITE_MAX_GAMES` (default 150k, `None` = all 281k), `PRETRAIN_EPOCHS`,
`FINETUNE_EPOCHS`, `CHANNELS`/`BLOCKS` (model size).

## Edit the code
`sukhoi_bot.py` is the source of truth (`# %%` cells). After editing, regenerate the notebook:

```bash
python3 chess-bot/build_notebook.py
```

It also runs locally: `DATA_DIR=data OUT_DIR=chess-bot/out python chess-bot/sukhoi_bot.py`
(needs `torch numpy chess`).
