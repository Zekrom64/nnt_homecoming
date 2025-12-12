from build_api import ProcessTask
import glob

class WebpackTask(ProcessTask):
	def __init__(self):
		super().__init__('webpack', 'Build - Webpack')

	@property
	def is_shell(self):
		return True

	@property
	def executable_args(self):
		return ['npm', 'run', 'build']

	def enumerate_files(self):
		return glob.glob("ts/**", recursive=True)
