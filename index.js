const venom = require('venom-bot');
const express = require('express');
const http = require('http');
const {WebhookClient} = require('dialogflow-fulfillment');
const dialogflow = require('@google-cloud/dialogflow');
const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);

venom
    .create({headless: true})
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

    //webhook dialogflow
    app.post('/webhook', function(request,response){
        const agent = new WebhookClient ({ request, response});
        let intentMap = new Map();
        intentMap.set('Pergunta 1', nomedafuncao)
        agent.handleRequest(intentMap);
    });
    function nomedafuncao (agent) {
    }

const sessionClient = new dialogflow.SessionsClient({keyFilename: "chatbot-univesp-hwyf-6eec34ed92bf.json"});

async function detectIntent(
    projectId,
    sessionId,
    query,
    context, // aqui era plural
    languageCode
) {
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    // Text query request
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };

    if (context && contexts.length > 0) {
        request.queryParams = {
            contexts: contexts,
        };
    }

    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}

async function executeQueries(projetcId, sessionId, queries, languageCode) {
    let context;
    let intentResponse;
    for (const query of queries) {
        try {
            console.log(`Pergunta: ${query}`);
            intentResponse = await detectIntent(
                projetcId,
                sessionId,
                query,
                context,
                languageCode
            );
            console.log('Enviando Resposta');
            console.log(intentResponse.queryResult.fulfillmentText);
            return `${intentResponse.queryResult.fulfillmentText}`
        } catch (error) {
            console.log(error);
        }
    }
}

function start(client) {
    client.onMessage(async (msg) => {

        if (msg.type === "chat"){
            //integração de texto dialogflow
            let textoResposta = await executeQueries("chatbot-univesp-hwyf", msg.from, [msg.body], 'pt-BR')
            client.sendText(msg.from, textoResposta.replace(/\\n/g, '\n'));
        }

    });
}

server.listen(port, function() {
    console.log('App running on *: ' + port);
});
