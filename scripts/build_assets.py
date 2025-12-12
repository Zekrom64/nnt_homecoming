from build_api import Task
import glob
import os
import pathlib
import PIL
import PIL.Image

unnormalized_formats = [ '.jpg', '.png', '.gif' ]

def normalize_image(path: pathlib.Path):
	outpath = path.with_suffix('.webp')

	try:
		with PIL.Image.open(str(path)) as input:
			input.save(str(outpath), format='webp', save_all=True)
		os.remove(str(path))
		print(f"Normalized image '{path}' to {outpath}")
	except:
		print(f"Failed to convert image '{path}'!")
		pass

class AssetImageNormalizationTask(Task):
	def __init__(self):
		super().__init__('asset-normalize-images', "Assets - Normalize Image Formats")

	def run(self):
		for file in glob.glob('assets/images/**', recursive=True):
			path = pathlib.Path(file)
			if path.suffix in unnormalized_formats:
				normalize_image(path)
		return True