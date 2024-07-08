import datetime
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