from build_api import ProcessTask
import glob
import os
import platform

tweego_home = os.environ.get('TWEEGO_HOME')
if tweego_home is None:
	print("Environment variable TWEEGO_HOME is not set!")
	exit(-1)

tweego_exec = os.path.abspath(f"{tweego_home}/tweego{'.exe' if 'Windows' in platform.platform() else ''}")
if not os.path.isfile(tweego_exec):
	print(f"Tweego executable does not exist at \'{tweego_exec}\'!")
	exit(-1)

class TweegoTask(ProcessTask):
	output_file: str

	def __init__(self, output_file):
		super().__init__('tweego', 'Build - Tweego')
		self.output_file = output_file

	@property
	def executable_args(self):
		return [
			tweego_exec,
			'-f', 'snowman-2',
			'-m', './build/js/',
			'-m', './styles/',
			'./passages/'
		]
	
	@property
	def stdout(self):
		return open(self.output_file, 'w')

	def check_if_dirty(self):
		return not os.path.exists(self.output_file)

	def enumerate_files(self):
		files = glob.glob("passages/**", recursive=True)
		files.extend(glob.glob("styles/**", recursive=True))
		return files
