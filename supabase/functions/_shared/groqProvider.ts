import type { AIProvider, ProviderChatInput, ProviderChatResult } from './provider'
import type { ChatMessage } from './types'

const GROQ_API_URL =
  'https://api.groq.com/openai/v1/chat/completions'


function toGroqMessages(messages: ChatMessage[]) {
  return messages
    .filter((m) => m.content?.trim())
    .map((m) => ({
      role:
        m.role === 'assistant'
          ? 'assistant'
          : m.role === 'user'
          ? 'user'
          : 'system',
      content: m.content,
    }))
}


function safeTrim(s: string, maxLen: number) {
  const t = s ?? ''
  return t.length > maxLen ? t.slice(0, maxLen) : t
}


export interface GroqConfig {
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}


export function createGroqProvider(
  config: GroqConfig
): AIProvider {

  const {
    apiKey,
    model,
    temperature,
    maxTokens,
  } = config


  if (!apiKey) {
    throw new Error(
      'Groq API key missing'
    )
  }


  async function callNonStream(
    input: ProviderChatInput
  ): Promise<string> {


    const body = {
      model,
      messages: toGroqMessages(input.messages),
      temperature,
      max_tokens: maxTokens,
    }


    const controller = new AbortController()

    const timeoutId = setTimeout(
      () => controller.abort(),
      30000
    )


    try {

      const res = await fetch(
        GROQ_API_URL,
        {
          method:'POST',

          headers:{
            'content-type':'application/json',
            accept:'application/json',
            authorization:`Bearer ${apiKey}`,
          },

          body:JSON.stringify(body),

          signal:controller.signal,
        }
      )


      if(!res.ok){

        const text =
          await res.text().catch(()=>'')

        throw new Error(
          `Groq failed ${res.status}: ${safeTrim(text,1200)}`
        )
      }


      const data =
        await res.json() as any


      return String(
        data?.choices?.[0]
        ?.message?.content || ''
      )


    } finally {

      clearTimeout(timeoutId)

    }
  }



  async function* callStream(
    input:ProviderChatInput
  ):AsyncGenerator<string>{


    const body={

      model,

      messages:
        toGroqMessages(input.messages),

      temperature,

      max_tokens:maxTokens,

      stream:true,

      stream_options:{
        include_usage:true
      }

    }


    const controller =
      new AbortController()


    const timeoutId =
      setTimeout(
        ()=>controller.abort(),
        30000
      )


    try{


      const res =
        await fetch(
          GROQ_API_URL,
          {
            method:'POST',

            headers:{
              'content-type':'application/json',
              accept:'text/event-stream',
              authorization:`Bearer ${apiKey}`,
            },

            body:JSON.stringify(body),

            signal:controller.signal,
          }
        )


      if(!res.ok){

        const text =
          await res.text().catch(()=>'')

        throw new Error(
          `Groq stream failed ${res.status}: ${safeTrim(text,1200)}`
        )

      }


      if(!res.body)
        return



      const reader =
        res.body.getReader()


      const decoder =
        new TextDecoder()


      let buffer=''


      while(true){

        const {
          value,
          done
        } =
        await reader.read()


        if(done)
          break


        buffer +=
          decoder.decode(
            value,
            {stream:true}
          )


        const lines =
          buffer.split('\n')


        buffer =
          lines.pop() || ''



        for(const line of lines){

          if(!line.startsWith('data:'))
            continue


          const json =
            line.replace('data:','').trim()


          if(json==='[DONE]')
            continue


          try{

            const parsed =
              JSON.parse(json)


            const delta =
              parsed
              ?.choices?.[0]
              ?.delta?.content


            if(delta)
              yield String(delta)


          }catch{

          }

        }

      }


    }finally{

      clearTimeout(timeoutId)

    }

  }



  return {

    id:'groq',

    async chat(
      input:ProviderChatInput
    ):Promise<ProviderChatResult>{

      return {
        text:
          await callNonStream(input)
      }

    },


    chatStream:
      callStream

  }

}