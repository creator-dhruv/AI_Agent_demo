# Arithmetic AI Agent with LangGraph & Gemini

## Overview

This project is a terminal-based AI Agent built using LangGraph, LangChain, and Google's Gemini model. The agent can perform arithmetic operations using tool calling instead of calculating directly inside the language model.

The system demonstrates:

* Tool Calling
* Agent Workflows
* LangGraph State Management
* Gemini Function Calling
* Interactive Terminal Chat

---

# Features

* Addition
* Subtraction
* Multiplication
* Division
* Interactive CLI Chat
* Tool-Based Reasoning
* Agent Loop using LangGraph
* Gemini Integration

---

# Tech Stack

## AI Framework

* LangChain
* LangGraph

## LLM

* Gemini Flash Lite
* Google Generative AI API

## Language

* TypeScript

## Validation

* Zod

## Runtime

* Node.js

---

# Project Architecture

```text
User
 │
 ▼
Terminal Input
 │
 ▼
Chat Loop
 │
 ▼
LangGraph Agent
 │
 ▼
LLM Node
 │
 ▼
Tool Selection
 │
 ▼
Tool Execution
 │
 ▼
Tool Response
 │
 ▼
LLM Final Response
 │
 ▼
Terminal Output
```

---

# Folder Structure

```text
project/
│
├── src/
│   └── index.ts
│
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

# Environment Variables

Create a `.env` file:

```env
GOOGLE_API_KEY=your_gemini_api_key
```

---

# Installation

Install dependencies:

```bash
npm install
```

Required packages:

```bash
npm install \
@langchain/core \
@langchain/google-genai \
@langchain/langgraph \
dotenv \
zod
```

---

# Running the Project

```bash
npx tsx src/index.ts
```

Example:

```text
You: Add 10 and 20

AI: 30

You: Multiply 6 by 8

AI: 48
```

Type:

```text
exit
```

to terminate the application.

---

# Core Components

## 1. Gemini Model

```ts
const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-3.1-flash-lite",
    temperature: 0,
});
```

Purpose:

* Connects to Gemini
* Handles reasoning
* Decides when tools should be called

---

## 2. Arithmetic Tools

The agent contains four tools.

### Addition Tool

```ts
Addition(a, b)
```

Returns:

```text
a + b
```

---

### Subtraction Tool

```ts
Subtraction(a, b)
```

Returns:

```text
a - b
```

---

### Multiplication Tool

```ts
Multiplication(a, b)
```

Returns:

```text
a * b
```

---

### Division Tool

```ts
Division(a, b)
```

Returns:

```text
a / b
```

---

# Tool Registry

```ts
const tools = [
    addition,
    subtraction,
    multiplication,
    division
]
```

Purpose:

* Central tool collection
* Passed to Gemini
* Enables tool calling

---

# Tool Lookup Map

```ts
const toolsByName = Object.fromEntries(
    tools.map(tool => [tool.name, tool])
)
```

Purpose:

* Fast tool retrieval
* O(1) lookup

Instead of searching through the tools array every time.

---

# LLM With Tools

```ts
const llmWithTools = llm.bindTools(tools)
```

Purpose:

Allows Gemini to:

* Discover available tools
* Generate tool calls
* Receive tool outputs

---

# Graph Nodes

The agent contains two nodes.

## Node 1: llmCall

```ts
async function llmCall(...)
```

Responsibilities:

* Receives current conversation state
* Sends messages to Gemini
* Determines if a tool should be called
* Produces an AI response

Output:

```ts
{
    messages: [result]
}
```

---

## Node 2: toolNode

```ts
async function toolNode(...)
```

Responsibilities:

* Reads tool requests
* Executes the requested tool
* Returns tool output

Example:

```text
Tool Call:
Addition(3, 4)

Result:
7
```

Output:

```ts
{
    messages: [ToolMessage]
}
```

---

# Decision Logic

## shouldContinue()

```ts
function shouldContinue(...)
```

Purpose:

Determines whether:

* The graph should execute a tool
* The graph should stop

Logic:

```text
Tool Calls Present?
      │
   Yes ▼
    tools
      │
   No ▼
    END
```

---

# LangGraph Workflow

```ts
const agentBuilder = new StateGraph(...)
```

Workflow:

```text
START
 │
 ▼
llmCall
 │
 ▼
Tool Needed?
 │
 ├─ Yes ─► tools
 │           │
 │           ▼
 │        llmCall
 │
 └─ No ─► END
```

---

# Chat History

```ts
let messages = []
```

Stores:

```text
User Messages
Assistant Responses
Tool Outputs
```

Used as conversation memory during runtime.

---

# Summary Storage

```ts
let summary = []
```

Purpose:

Stores concise agent outputs for future:

* Summarization
* Memory systems
* Conversation analysis

---

# aiCall Function

```ts
async function aiCall(messages)
```

Responsibilities:

1. Execute LangGraph workflow
2. Run tools if required
3. Capture final AI response
4. Update conversation state
5. Return updated messages

Flow:

```text
Messages
   │
   ▼
Agent Graph
   │
   ▼
Tool Calls
   │
   ▼
Final Answer
   │
   ▼
Update History
```

---

# Terminal Interface

```ts
async function chat()
```

Purpose:

Provides a continuous CLI chat experience.

Flow:

```text
User Input
   │
   ▼
Agent
   │
   ▼
Response
   │
   ▼
Repeat
```

Loop exits when:

```text
exit
```

is entered.

---

# Example Conversation

```text
You: Add 5 and 7

AI: 12

You: Divide 100 by 4

AI: 25

You: Multiply 8 by 9

AI: 72

You: exit
```

---

# Learning Objectives

This project demonstrates:

* Tool Calling with Gemini
* LangGraph Workflows
* State-Based Agents
* Function Calling
* Agent Loops
* Interactive CLI Applications
* TypeScript Agent Development

---

# Future Improvements

## Memory

Store previous calculations in Redis or a database.

## More Tools

Add:

* Square Root
* Power
* Modulus
* Percentage
* Scientific Calculator Functions

## Persistence

Save chat history across sessions.

## Streaming

Stream Gemini responses token-by-token.

## Web Interface

Replace terminal interaction with:

* React
* Next.js
* WebSockets

## Multi-Agent System

Create separate:

* Planner Agent
* Calculator Agent
* Memory Agent

for more advanced workflows.

---

# License

MIT License
