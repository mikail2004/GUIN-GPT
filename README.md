# GUIN-GPT
Ready-to-use code for integrating an LLM (specifically by OpenAI) into your Python or Node.js project. It includes conversational context storage via SQLite and JSON to simulate personality-driven AI companions. There is also a summarization tool for context management. `package.json` has been included to provide clarity on the required Node.js configuration. 

Note: You must create a `.env` file with your OpenAI API key. 

### Database
`guinMemories.json`: JSON file for storing conversation history in Python

`memory.db`:	SQLite database file for storing conversation history in JS (Node.js)

### Node.js Requirements
```
openai
dotenv
readline
sqlite3
```

### Python Requirements
```
openai
dotenv
```

