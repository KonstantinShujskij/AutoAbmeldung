const OpenAI = require('openai')
const config = require('config')

const { encodeImageToBase64 } = require('./file.utils')


const apiKey = config.get('gptApiKey')
const openai = new OpenAI({ apiKey })
const model = "gpt-4.1-mini"


const extractFunctionZBII = {
    type: "function",
    function: {
        name: "parse_zb2",
        description: "Извлекает данные из документа ZB2 (Teil II). Всегда выбирает колонку с самой поздней датой и достаёт только связанные данные. данные из одной колонки, ты не можешь брать данные из разных колонок!!",
        parameters: {
            type: "object",
            required: ["name", "VIN", "number", "address", "firstName", "lastName", "familyName"],
            properties: {
                fullName: { type: "string", description: "ФИО владельца, из колонки с самой поздней датой регистрации." },
                firstName: { type: "string", description: "Имя владельца, из ФИО." },
                lastName: { type: "string", description: "Фамилия владельца, из ФИО." },
                familyName: { type: "string", description: "Отчество владельца, из ФИО." },

                address: { type: "string", description: "Адрес владельца, из той же колонки, что и ФИО." },
                street: { type: "string", description: "Улица и номер дома владельца, из адреса." },
                postalCode: { type: "string", description: "Почтовый индекс владельца, из адреса." },
                city: { type: "string", description: "Город владельца, из адреса." },

                number: { type: "string", description: "Номерной знак (Kennzeichen) из строки с самой поздней датой, из той же колонки, что и ФИО." },
                VIN: { type: "string", description: "VIN номер машины. Берётся ТОЛЬКО из технического блока поля E (нижняя часть документа), никак не из колонок." }
            },
            additionalProperties: false,
        },
    },
} 

const extractFunctionZBI = {
    type: "function",
    function: {
        name: "parse_zb1",
        description: "Извлекает секретный код из документа ZB1 (Teil I). Код находится ПОД синей или зеленой наклейкой. Если наклейка не отклеена и код физически НЕ виден на изображении, обязательно верни пустую строку ''.",
        parameters: {
            type: "object",
            required: [
                "code",
            ],
            properties: {
                code: { 
                    type: "string", 
                    description: "Секретный код ZB1 — это РОВНО 7 подряд идущих символов (латинские буквы и/или цифры), которые становятся видимыми только после снятия защитной фольги внутри цветной наклейки документа ZB1. Ты обязан вернуть исключительно эту 7-символьную последовательность. Если ты видешь последовательность с пробелом, возьми ту часть которая состоит из 7 символов! Если внутри наклейки присутствуют другие надписи, например серийные номера, технические ID или комбинации символов вокруг кода, ты должен полностью их игнорировать и извлекать ТОЛЬКО ту часть, которая представляет собой ровно 7 последовательных символов. Если такой 7-символьной последовательности нет, она частично скрыта или не читается — верни пустую строку ''.",
                },
            },
            additionalProperties: false,
        },
    },
} 

const extractFunctionFront = {
    type: "function",
    function: {
        name: "parse_front",
        description: "Считать трёхбуквенный код с круглой наклейки на изображении. Код должен быть прочитан визуально. Если код нечитаем, функция не вызывается.",
        parameters: {
            type: "object",
            properties: {
                code: {
                    type: "string",
                    description: "Трёхбуквенный код, визуально считанный с изображения."
                }
            },
            additionalProperties: false,
        },
    },
}


const extractFunctionBack = {
    type: "function",
    function: {
        name: "parse_back",
        description: "Считать трёхбуквенный код с круглой наклейки на изображении. Код должен быть прочитан визуально. Если код нечитаем, функция не вызывается.",
        parameters: {
            type: "object",
            properties: {
                code: {
                    type: "string",
                    description: "Трёхбуквенный код, визуально считанный с изображения."
                }       
            },
            additionalProperties: false,
        },
    },
} 


async function getData(messages, funObj) {
    try {
        const completion = await openai.chat.completions.create({ model, messages, tools: [ funObj ], tool_choice: "auto" })        

        const toolCalls = completion.choices[0]?.message?.tool_calls;
        if(toolCalls) { return JSON.parse(toolCalls[0].function.arguments) } 
    
        return null
    } 
    catch(error) {
        console.log("GPT Error", error)
        return null
    }
}

async function getImageData(fileName, funObj) {
    const base64Image = encodeImageToBase64(fileName)      
    if(!base64Image) { 
        console.log("Ошибка кодирования изображения в base64")        
        return null 
    }  

    const messages = [
        { role: "user", content: `Всегда вызывай функцию ${funObj?.function?.name}, вне зависимости от обстоятельств, без каких-либо исключений или условий.` },
        { role: "user", content: [{ type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }] }
    ]

    return await getData(messages, funObj)
}


async function extractZBII(fileName) {
    return getImageData(fileName, extractFunctionZBII)
}

async function extractZBI(fileName) {
    const data = await getImageData(fileName, extractFunctionZBI)
    if(data?.code.length !== 7) { data.close = true }

    return data
}

async function extractFront(fileName) {
    return getImageData(fileName, extractFunctionFront)
}

async function extractBack(fileName) {
    return getImageData(fileName, extractFunctionBack)
}


module.exports = {
    extractZBII,
    extractZBI,
    extractFront,
    extractBack
}
