import urllib.parse

from contract.settings import PAGE_SETTINGS


class PageBuilder:
	def __init__(self, page: str):
		if page in PAGE_SETTINGS:
			self.settings = PAGE_SETTINGS[page]
		else:
			self.settings = PAGE_SETTINGS["DEFAULT"]

	def build_get_params(self, get_params):
		obj = {}
		for _param in self.settings["GET_PARAMS"]:
			if _param not in get_params:
				obj[_param] = self.settings["GET_PARAMS"][_param]
			else:
				obj[_param] = get_params[_param]
		for _param in get_params:
			if _param not in obj:
				obj[_param] = get_params[_param]
		self.settings["GET_PARAMS"] = obj
		return urllib.parse.urlencode(obj)

	def route_with_params(self, get_obj):
		if urllib.parse.urlencode(get_obj) != urllib.parse.urlencode( self.settings["GET_PARAMS"]):
			return True

