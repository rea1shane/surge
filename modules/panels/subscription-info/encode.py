import urllib.parse

url = "https://www.example.com/search?q=hello world"

print(urllib.parse.quote(url, safe=""))
