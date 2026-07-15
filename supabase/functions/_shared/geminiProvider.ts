import type {
  AIProvider,
  ProviderChatInput,
  ProviderChatResult
} from './provider'

import type { ChatMessage } from './types'


const GEMINI_BASE =
  'https://generativelanguage.googleapis.com/v1beta/models'


export interface GeminiConfig {
  apiKey:string
  model:string
  temperature:number
  maxTokens:number
}



function toGeminiContents(messages:ChatMessage[]) {

  const contents:
    Array<{
      role:'user'|'model'
      parts:Array<{text:string}>
    }> = []


  let systemInstruction:string|null = null


  for(const m of messages){

    if(m.role==='system'){
      systemInstruction=m.content
      continue
    }


    if(!m.content?.trim())
      continue


    contents.push({

      role:
        m.role==='assistant'
        ? 'model'
        : 'user',

      parts:[
        {
          text:m.content
        }
      ]

    })

  }


  if(contents.length===0){

    contents.push({

      role:'user',

      parts:[
        {
          text:'Hello'
        }
      ]

    })

  }


  return {
    contents,
    systemInstruction
  }

}



function safeTrim(
  s:string,
  maxLen:number
){

  const t=s??''

  return t.length>maxLen
    ? t.slice(0,maxLen)
    : t

}



export function createGeminiProvider(
  config:GeminiConfig
):AIProvider{


  const {
    apiKey,
    model,
    temperature,
    maxTokens
  }=config



  if(!apiKey){

    throw new Error(
      'Gemini API key missing'
    )

  }




  async function callNonStream(
    input:ProviderChatInput
  ):Promise<string>{


    const {
      contents,
      systemInstruction
    }=
    toGeminiContents(input.messages)



    const body:any={

      contents,

      generationConfig:{

        temperature,

        maxOutputTokens:
          maxTokens

      }

    }



    if(systemInstruction){

      body.systemInstruction={

        parts:[
          {
            text:systemInstruction
          }
        ]

      }

    }



    const url =
      `${GEMINI_BASE}/${model}:generateContent?key=${apiKey}`



    const controller =
      new AbortController()



    const timeout =
      setTimeout(
        ()=>controller.abort(),
        30000
      )



    try{


      const res =
        await fetch(
          url,
          {

            method:'POST',

            headers:{

              'content-type':
                'application/json',

              accept:
                'application/json'

            },

            body:
              JSON.stringify(body),

            signal:
              controller.signal

          }
        )



      if(!res.ok){

        const text =
          await res.text().catch(()=>'')

        throw new Error(
          `Gemini failed ${res.status}: ${safeTrim(text,1200)}`
        )

      }



      const data =
        await res.json() as any



      return String(

        data
        ?.candidates?.[0]
        ?.content?.parts
        ?.map((p:any)=>p.text||'')
        ?.join('')
        ||
        ''

      )


    }finally{

      clearTimeout(timeout)

    }

  }






  return {

    id:'gemini',


    async chat(
      input:ProviderChatInput
    ):Promise<ProviderChatResult>{

      return {

        text:
          await callNonStream(input)

      }

    },


    // Streaming can remain here
    // when UI supports token streaming

  }


}