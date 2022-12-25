import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, 
});

const openai = new OpenAIApi(configuration);

const app = express(); 
app.use(cors()); //couple of mibblewares to allow us to make cross origin requests and allow our server to be called from the frontend 
app.use(express.json());  // allow us to pass json from the frontend to the backend 

app.get('/', async (request, response) => { //with the get route, you can't really receive a lot of data
    response.status(200).send({             // from the frontend 
        message: "hello from AI",
    })
});

app.post("/", async (request, response) => {         // the post one allows us to have a body or a payload
    try {
        const prompt = request.body.prompt;

        const res = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `${prompt}`, 
            temperature: 0.7,  // higher temp value means the model will take more risks 
            max_tokens: 3000,    // max no of tokens to generate in a response || The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
            top_p: 1, // alternative to sampling with temperature, called nucleus sampling
            frequency_penalty: 0.5, // not going to repeat similar sentences often || // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
            presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
        });

        response.status(200).send({
            bot: res.data.choices[0].text
        })

    } catch (error) {
        console.error(error);
        response.status(500).send({error})
    }
})   

app.listen(5000, () => console.log("AI server started on port http://localhost:5000"));