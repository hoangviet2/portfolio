"""Convert sukhoi_bot.py (# %% cell markers) into SukhoiBot_Colab.ipynb."""
import json, re, pathlib

src = pathlib.Path(__file__).with_name("sukhoi_bot.py").read_text()
cells = []
for chunk in re.split(r"^# %%", src, flags=re.M)[1:]:
    header, _, body = chunk.partition("\n")
    body = body.strip("\n")
    if header.strip() == "[markdown]":
        text = "\n".join(re.sub(r"^# ?", "", l) for l in body.splitlines())
        cells.append({"cell_type": "markdown", "metadata": {}, "source": text.splitlines(True)})
    else:
        cells.append({"cell_type": "code", "metadata": {}, "execution_count": None,
                      "outputs": [], "source": body.splitlines(True)})

nb = {"nbformat": 4, "nbformat_minor": 5, "cells": cells,
      "metadata": {"accelerator": "GPU", "colab": {"provenance": [], "gpuType": "T4"},
                   "kernelspec": {"name": "python3", "display_name": "Python 3"}}}
out = pathlib.Path(__file__).with_name("SukhoiBot_Colab.ipynb")
out.write_text(json.dumps(nb, indent=1))
print("wrote", out, f"({len(cells)} cells)")
