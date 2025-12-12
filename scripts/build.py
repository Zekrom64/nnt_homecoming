import os

import build_api
import build_twee
import build_webpack
import build_assets

os.makedirs('build/js', exist_ok=True)

tasks: list[build_api.Task] = []

webpack = build_webpack.WebpackTask()
tasks.append(webpack)

tweego = build_twee.TweegoTask("nnt_homecoming.html")
tweego.dependencies.append(webpack)
tasks.append(tweego)

asset_normalize_images = build_assets.AssetImageNormalizationTask()
tasks.append(asset_normalize_images)

for task in tasks:
	print(f"||| {task.name}")
	task.run()
