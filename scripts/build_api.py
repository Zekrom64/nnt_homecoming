from abc import ABC, abstractmethod
from hashlib import sha256
import os
import struct
import subprocess
import typing

class Task(ABC):
	id: str
	name: str

	def __init__(self, id, name):
		self.id = id
		self.name = name

	@abstractmethod
	def run(self) -> bool:
		pass

class OnlyOnChangeTask(Task):
	has_run: bool
	dependencies: "list[OnlyOnChangeTask]"

	def __init__(self, id, name):
		super().__init__(id, name)
		self.has_run = False
		self.dependencies = []

	@abstractmethod
	def run_impl(self) -> bool:
		pass

	def generate_hash(self):
		hash = sha256(self.id.encode())
		for file in self.enumerate_files():
			# Should technically hash on the file contents, but
			# the modification time is faster
			hash.update(struct.pack('Q', int(os.path.getmtime(file))))
		return hash

	def enumerate_files(self) -> list[str]:
		return []

	def check_if_dirty(self) -> bool:
		return False

	def run(self):
		hash = self.generate_hash().digest().hex()
		hashfile = f"build/{self.id}.hash"
		has_file = os.path.isfile(hashfile)
		dirty = True
		# Check hash file to determine if hashes match
		if has_file:
			with open(hashfile, 'r') as f:
				if f.read() == hash:
					dirty = False
		# Force dirty state if a dependency has run
		for dep in self.dependencies:
			if dep.has_run:
				dirty = True
		# Force dirty state if requested by task
		if self.check_if_dirty():
			dirty = True
		# Run the underlying task if dirty, and save the hash on success
		if dirty:
			result = self.run_impl()
			self.has_run = True
			if result:
				with open(hashfile, 'w') as f:
					f.write(hash)
			elif has_file:
				os.remove(hashfile)
			return result
		else:
			return False

class ProcessTask(OnlyOnChangeTask):
	def __init__(self, id, name):
		super().__init__(id, name)

	@property
	def is_shell(self) -> bool:
		return True
	
	@property
	@abstractmethod
	def executable_args(self) -> list[str]:
		pass
	
	@property
	def stdout(self) -> None | int | typing.IO[typing.Any]:
		return None

	def run_impl(self):
		proc = subprocess.run(
			self.executable_args,
			stdout=self.stdout,
			shell=self.is_shell
		)
		return proc.returncode == 0
