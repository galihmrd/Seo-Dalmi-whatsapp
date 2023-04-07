import os
import openai
import codecs
import speech_recognition as sr
from pydub import AudioSegment
from multiprocessing import Process

input_gpt = []


def ocrAI(photo, filename, key):
    try:
       os.system(f"cd downloads && tesseract {photo} {filename}")
       f = open(f"./downloads/{filename}.txt", "r")
       text = f.read()
       f.close()
       # print(text)
       os.remove(photo)
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
