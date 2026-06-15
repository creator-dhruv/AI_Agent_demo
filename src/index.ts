import { tool } from "@langchain/core/tools"
import z from "zod";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolMessage } from "@langchain/core/messages";

dotenv.config()

const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-3.1-flash-lite",
    temperature: 0,
});


const addition = tool((({ a, b }: { a: number, b: number }) => {
    return `${a + b}`;
}), {
    name: "Addition",
    description: "Add two numbers",
    schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
    })
})
const subtraction = tool((({ a, b }: { a: number, b: number }) => {
    return `${a - b}`;
}), {
    name: "Subtraction",
    description: "Subtract two numbers",
    schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
    })
})
const multiplication = tool((({ a, b }: { a: number, b: number }) => {
    return `${a * b}`;
}), {
    name: "Multiplication",
    description: "Multiply two numbers",
    schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
    })
})
const division = tool((({ a, b }: { a: number, b: number }) => {
    return `${a / b}`;
}), {
    name: "Division",
    description: "Divide two numbers",
    schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
    })
})

const tools = [addition, subtraction, multiplication, division]
const toolsByName = Object.fromEntries(tools.map((tool) => [tool.name, tool]))

const llmWithTools = llm.bindTools(tools)


async function llmCall(state: typeof MessagesAnnotation.State) {
    const result = await llmWithTools.invoke([
        {
            role: "system",
            content: "You are the helpful AI agent, who perform arthimetic operations on set of operations."
        },
        ...state.messages
    ])

    return {
        messages: [result]
    }
}

async function toolNode(state: typeof MessagesAnnotation.State) {

    const results: ToolMessage[] = [];
    const lastMessage = state.messages.at(-1)
    // console.log("Tool call started")

    if (lastMessage?.tool_calls?.length) {
        for (const toolCall of lastMessage.tool_calls) {
            const tool = toolsByName[toolCall.name]
            const observation = await tool.invoke(toolCall.args)
            results.push(
                new ToolMessage({
                    content: observation,
                    tool_call_id: toolCall.id,
                })
            )
        }
    }
    // console.log("Tool call ended")
    return { messages: results }
}

function shouldContinue(state: typeof MessagesAnnotation.State) {
    const messages = state.messages
    const lastMessage = messages.at(-1)

    if (lastMessage?.tool_calls?.length) {
        return "Action"
    }

    return "__end__"
}


const agentBuilder = new StateGraph(MessagesAnnotation)
    .addNode("llmCall", llmCall)
    .addNode("tools", toolNode)
    .addEdge("__start__", "llmCall")
    .addEdge("tools", "llmCall")
    .addConditionalEdges(
        "llmCall",
        shouldContinue,
        {
            "Action": "tools",
            "__end__": "__end__"
        }
    )
    .compile()


let messages: { role: string; content: string | object | undefined }[] = []
let summary: { role: string; content: string | object | undefined }[] = []

async function aiCall(messages: { role: string; content: string; }[]) {

    const result = await agentBuilder.invoke({ messages })

    messages = [
        ...messages,
        ...result.messages.map((item) => ({
            role: "system",
            content: typeof item.content == "string" ? item.content : `Tool called : ${item.content?.[0].functionCall.name}`,
        })),
    ];

    summary = [
        ...summary,
        {
            role: "System",
            content: typeof result.messages.at(-1)?.content == "string" ? result.messages.at(-1)?.content : `Tool called : ${result.messages.at(-1)?.content?.[0].functionCall.name}`
        }
    ]


    return messages

}

import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";


// let messages: { role: string; content: string }[] = [];

async function chat() {
    const rl = readline.createInterface({ input, output });
    while (true) {
        const prompt = await rl.question("You: ");

        if (prompt === "exit") break;

        messages.push({
            role: "user",
            content: prompt,
        });

        const response = await aiCall(messages);
        console.log("AI : ", response.at(-1)?.content)

    }
    rl.close();
}


chat()



