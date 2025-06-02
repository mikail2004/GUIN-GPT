# Guinevere
import os
import json
import openai
from dotenv import load_dotenv

load_dotenv(override=True)
OPENAI_KEY = os.getenv("OPENAI_KEY") 
openai.api_key = OPENAI_KEY
memoriesPath = "C:/Users/m20mi/Documents/Work/Guinevere/guinMemories.json"

#Prompt assignments
botPersonality = 'Your goal is to be conversational and inviting, never ever act as an assistant. Your replies will only be short. Never apologise. You remember by being given a memory.'
exampleOutput = "" # An example of how your bot should reply

messageSet = [{"role":"system", "content":botPersonality}, #System is used to set personality
              {"role":"assistant", "content":exampleOutput},] #Assistant is used to input the bot's own output to direct its future actions

def purgeMemory():
    json_object = json.dumps(messageSet, indent=4)
    with open(memoriesPath, "w") as outfile:
        outfile.write(json_object)

def converse(userMSG):
    with open(memoriesPath, 'r') as openfile:
        memories = json.load(openfile)

    memories.append({"role":"user", "content":userMSG}) #User is used to input the user prompt

    botResponse = openai.chat.completions.create(model="gpt-4o-mini", messages=memories) #Actual GPT function that takes in our prompts
    assistantContent = botResponse.choices[0].message.content #Catching the GPT model's output

    memories.append({"role":"assistant", "content":assistantContent}) #Plugging in the output for future prompts

    memoryReturn = json.dumps(memories, indent=4)
    with open(memoriesPath, "w") as outfile:
        outfile.write(memoryReturn)

    return assistantContent

def summarizeMemories():
    summaryPrompt = """Summarize the entire conversation you had up till now in full detail as if these are your own memories.
    Do it without saying your name, and include anything you were told to remember,
    or anything of significance to you or me. Exclude any reference to this message I'm telling you right now inside the
    summarisation."""

    # Load memories
    with open(memoriesPath, 'r') as openfile:
        memories = json.load(openfile)

    # Summarize using loaded memories
    memories.append({"role":"user", "content":summaryPrompt})
    botResponse = openai.chat.completions.create(model="gpt-4o-mini", messages=memories)
    Summary = botResponse.choices[0].message.content

    # Reset memories and add summary to the default config
    messageSet.append({"role":"assistant", "content":Summary})
    json_object = json.dumps(messageSet, indent=4)
    with open(memoriesPath, "w") as outfile:
        outfile.write(json_object)

if __name__ == "__main__":
    Running = True
    count = 0
    try:
        while Running == True:
            print("")
            userContent = str(input("Prompt: "))
            botContent = converse(userContent)
            count += 1
            print("[" + str(count) + "]", "GUIN:", botContent) #Printing the output
            print("")
            
            if count == 100:
                summarizeMemories()
                Running = False
    except Exception as e:
        print("")
        print("The Following Error Occurred:", e)
