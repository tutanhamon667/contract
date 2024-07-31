import datetime
import os
import random
class FileSaver:
	def __init__(self, file, destination):
		self.file = file
		self.destination = destination
		self.file.name = self.generate_unique_file_name()
  
	def generate_unique_file_name(self):
		return str(datetime.datetime.timestamp( datetime.datetime.now() ))+ self.file.name

	def save_file(self):
		with open(self.destination + self.file.name, 'wb+') as destination:
			for chunk in self.file.chunks():
				destination.write(chunk)

	@staticmethod
	def get_random_color():
		return "#"+''.join([random.choice('0123456789ABCDEF') for j in range(6)])
	

	@staticmethod
	def get_random_image():
		BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
		STATIC_DIR = os.path.join(BASE_DIR, 'static')
		file_path = os.path.join(STATIC_DIR, 'users/img/profile/')
		files = os.listdir(file_path)
		random_file = random.choice(files)
		return  random_file