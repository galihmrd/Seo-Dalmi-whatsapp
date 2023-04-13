import os
import subprocess
import requests
import openai
import codecs
import shlex
import speech_recognition as sr
from random import randint
from pydub import AudioSegment

input_gpt = []


def ocrAI(photo, filename, key):
    try:
       os.system(f"cd downloads && tesseract {photo} {filename}")
       f = open(f"./downloads/{filename}.txt", "r")
       text = f.read()
       f.close()
       # print(text)
       return chat_gpt(text, key)
    except Exception as e:
       print(e)

def chat_gpt(text, key):
    input_gpt.append(text)
    print(input_gpt[0])
    try:
       openai.api_key = key
       response = openai.ChatCompletion.create(model="gpt-3.5-turbo", messages=[{"role": "user", "content": input_gpt[0]}], max_tokens=3800, stop=None)
       return response.choices[0].message.content
    except Exception as e:
       return e

def speech2text(file_name, key):
    r = sr.Recognizer()
    wfn = file_name.replace('.opus','.wav')
    x = AudioSegment.from_file(file_name)
    file = x.export(wfn, format='wav')
    with sr.AudioFile(wfn) as source:
        audio_data = r.record(source)
        return chat_gpt(r.recognize_google(audio_data, language="id"), key)

def download_vid(url):
#    print(url)
    random_numb = randint(0,10000)
    file_name = f"vid-{random_numb}-SeoDalmi_socialMedia.mp4"
    path = "./downloads/" + file_name
    response = requests.get(url)
    open(path, "wb").write(response.content)
    size = os.path.getsize(path)
    if size > 50000000:
        return f"size limit! 50000000 bytes, file size is {size} bytes"
    else:
        return file_name

def ffmpeg_vid():
    os.system('cd downloads && ffmpeg -y -r 0.2 -i image.jpg -i sound.mp3 -vcodec libx264 -crf 25 -preset veryslow -acodec copy -movflags +faststart video.mp4')
    os.remove('./downloads/image.jpg')
    os.remove('./downloads/sound.mp3')
    return "video.mp4"
