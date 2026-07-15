import type { ChatMessage } from '../_shared/types.ts'
import { getProviderFromEnv } from '../_shared/providerSelector.ts'


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}



async function requireEnv(name: string): Promise<string> {

  const value =
    (globalThis as any)
      ?.Deno
      ?.env
      ?.get?.(name) as string | undefined


  if (!value) {
    throw new Error(
      `Missing ${name} in Edge Function environment variables`
    )
  }

  return value
}




type AiActionRequestBody =

  | {
      action:'conversation_title'
      conversation_id:string
      first_user_text:string
    }

  | {

      action:'generate_file_artifact'

      file_id?:string

      files?:Array<{
        file_id:string
        text?:string
      }>

      artifact_type?:
        | 'summary'
        | 'explanation'
        | 'quiz'
        | 'flashcards'
        | 'qa'

      prompt?:string

      extracted_text?:string
    }





function assertIsActionBody(
  body:any
):body is AiActionRequestBody {


  if(!body || typeof body!=='object')
    return false



  if(body.action==='conversation_title'){

    return (
      typeof body.conversation_id==='string'
      &&
      typeof body.first_user_text==='string'
    )

  }



  if(body.action==='generate_file_artifact'){


    if(body.files){

      if(!Array.isArray(body.files))
        return false



      for(const file of body.files){

        if(
          !file
          ||
          typeof file.file_id!=='string'
        )
          return false


        if(
          file.text!==undefined
          &&
          typeof file.text!=='string'
        )
          return false

      }

    }



    if(
      body.file_id!==undefined
      &&
      typeof body.file_id!=='string'
    )
      return false




    const allowed=[
      'summary',
      'explanation',
      'quiz',
      'flashcards',
      'qa'
    ]



    if(
      body.artifact_type
      &&
      !allowed.includes(body.artifact_type)
    )
      return false




    if(
      body.prompt!==undefined
      &&
      typeof body.prompt!=='string'
    )
      return false




    if(
      body.extracted_text!==undefined
      &&
      typeof body.extracted_text!=='string'
    )
      return false



    return true

  }



  return false

}





function safeTrimTitle(
  text:string
){

  const title =
    (text || '')
      .trim()
      .slice(0,60)


  return title || 'New conversation'

}




function safeJoinText(
  texts:string[]
){

  return texts
    .filter(Boolean)
    .join('\n\n')
    .slice(0,20000)

}






export default async function handler(
  req:Request
):Promise<Response>{



  if(req.method==='OPTIONS'){

    return new Response(
      'ok',
      {
        status:200,
        headers:corsHeaders
      }
    )

  }




  if(req.method!=='POST'){

    return new Response(

      JSON.stringify({
        error:'Method not allowed'
      }),

      {
        status:405,
        headers:{
          ...corsHeaders,
          'content-type':
            'application/json'
        }
      }

    )

  }





  const authHeader =
    req.headers.get('authorization') || ''



  if(!authHeader.startsWith('Bearer ')){


    return new Response(

      JSON.stringify({
        error:'Unauthorized'
      }),

      {
        status:401,
        headers:{
          ...corsHeaders,
          'content-type':
            'application/json'
        }
      }

    )

  }






  const supabaseUrl =
    await requireEnv(
      'SUPABASE_URL'
    )


  const serviceRoleKey =
    await requireEnv(
      'SUPABASE_SERVICE_ROLE_KEY'
    )



  const jwt =
    authHeader.replace(
      /^Bearer\s+/i,
      ''
    )






  // Verify logged-in user

  const userResponse =
    await fetch(

      `${supabaseUrl}/auth/v1/user`,

      {

        method:'GET',

        headers:{

          authorization:
            `Bearer ${jwt}`,

          apikey:
            serviceRoleKey

        }

      }

    )





  if(!userResponse.ok){

    return new Response(

      JSON.stringify({
        error:'Unauthorized'
      }),

      {
        status:401,
        headers:{
          ...corsHeaders,
          'content-type':
            'application/json'
        }
      }

    )

  }





  const user =
    await userResponse.json()



  const userId =
    user?.id





  if(!userId){

    return new Response(

      JSON.stringify({
        error:'Missing user id'
      }),

      {
        status:401,
        headers:{
          ...corsHeaders,
          'content-type':
            'application/json'
        }
      }

    )

  }





  const body =
    await req.json()
      .catch(()=>null)





  if(!assertIsActionBody(body)){


    return new Response(

      JSON.stringify({
        error:'Invalid payload'
      }),

      {
        status:400,
        headers:{
          ...corsHeaders,
          'content-type':
            'application/json'
        }
      }

    )

  }






  const supabaseHeaders = {

    authorization:
      `Bearer ${serviceRoleKey}`,

    apikey:
      serviceRoleKey,

    'content-type':
      'application/json',

    Prefer:
      'return=representation'

  }





  try {



    // -------------------------
    // Conversation title
    // -------------------------


    if(
      body.action==='conversation_title'
    ){


      const title =
        safeTrimTitle(
          body.first_user_text
        )



      const update =
        await fetch(

          `${supabaseUrl}/rest/v1/ai_conversations?id=eq.${encodeURIComponent(body.conversation_id)}&user_id=eq.${userId}`,

          {

            method:'PATCH',

            headers:
              supabaseHeaders,

            body:
              JSON.stringify({
                title
              })

          }

        )




      if(!update.ok){

        throw new Error(
          await update.text()
        )

      }




      return new Response(

        JSON.stringify({

          success:true,

          title

        }),

        {

          status:200,

          headers:{
            ...corsHeaders,
            'content-type':
              'application/json'
          }

        }

      )

    }






    // -------------------------
    // Generate artifact
    // -------------------------


    if(
      body.action==='generate_file_artifact'
    ){


      const artifactType =
        body.artifact_type || 'summary'




      const texts:string[]=[]



      if(body.extracted_text){

        texts.push(
          body.extracted_text
        )

      }




      if(body.files){

        for(
          const file of body.files
        ){

          if(file.text)
            texts.push(file.text)

        }

      }





      if(!texts.length){

        return new Response(

          JSON.stringify({

            error:
            'No extracted text provided'

          }),

          {
            status:400,
            headers:{
              ...corsHeaders,
              'content-type':
              'application/json'
            }
          }

        )

      }





      const sourceText =
        safeJoinText(texts)





      const provider =
        await getProviderFromEnv()




      const result =
        await provider.chat({

          mode:'general',

          messages:[

            {

              role:'system',

              content:
              'You are Takshara AI study assistant. Create clear educational content.'

            },


            {

              role:'user',

              content:

              `
Artifact type:
${artifactType}

Instruction:
${body.prompt || ''}


Source:

${sourceText}
`

            }

          ]

        })






      const fileId =
        body.file_id ||
        body.files?.[0]?.file_id ||
        null





      const insert =
        await fetch(

          `${supabaseUrl}/rest/v1/ai_file_artifacts`,

          {

            method:'POST',

            headers:
              supabaseHeaders,

            body:
              JSON.stringify({

                user_id:userId,

                file_id:fileId,

                artifact_type:
                  artifactType,

                payload:{

                  text:
                    result.text,

                  artifact_type:
                    artifactType,

                  prompt:
                    body.prompt || null

                }

              })

          }

        )






      if(!insert.ok){

        throw new Error(
          await insert.text()
        )

      }




      const saved =
        await insert.json()
          .catch(()=>[])



      return new Response(

        JSON.stringify({

          success:true,

          artifact_id:
            saved?.[0]?.id || null,

          artifact_type:
            artifactType,

          text:
            result.text

        }),

        {

          status:200,

          headers:{
            ...corsHeaders,
            'content-type':
              'application/json'
          }

        }

      )

    }





    return new Response(

      JSON.stringify({
        error:'Unknown action'
      }),

      {

        status:400,

        headers:{
          ...corsHeaders,
          'content-type':
            'application/json'
        }

      }

    )





  } catch(error:any){


    console.error(
      '[ai-action]',
      error
    )



    return new Response(

      JSON.stringify({

        error:
          error?.message ||
          'AI action failed'

      }),

      {

        status:500,

        headers:{
          ...corsHeaders,
          'content-type':
            'application/json'
        }

      }

    )


  }

}