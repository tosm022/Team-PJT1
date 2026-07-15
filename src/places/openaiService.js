import OpenAI from "openai";
import { allPlaces } from "./PlaceCard.js";


const COMPANION_MAP = {

  family: new Set(["12", "14", "39"]),

  friends: new Set(["28", "39"]),

  alone: new Set(["28", "14", "39"]),

  couple: new Set(["14", "39"])

};



// 지역 + 동행자 필터

export function filterPlaces({
  region,
  companion
}) {


  if (!region || !companion) {

    return [];

  }


  const typeSet =
    COMPANION_MAP[companion];


  if (!typeSet) {

    return [];

  }



  const regionLower =
    region.toLowerCase();



  return allPlaces.filter(place => {


    const addr =
      (
        place.addr1 || ""
      )
      .toLowerCase();



    const contentType =
      String(
        place.contenttypeid
        ||
        place.contentTypeId
        ||
        ""
      );



    return (

      addr.includes(regionLower)

      &&

      typeSet.has(contentType)

    );


  });


}





// 후보 Top N

export function topN(
  candidates,
  n = 20
){

  if(
    !Array.isArray(candidates)
    ||
    candidates.length === 0
  ){

    return [];

  }



  return [...candidates]
    .slice(0,n);


}





// OpenAI 장소 평가

async function scorePlaceWithOpenAI(

  place,

  {

    apiKey,

    companion,

    model="gpt-5-nano"

  }={}

){



  const client =
    new OpenAI({

      apiKey,

      dangerouslyAllowBrowser:true

    });




  const prompt = `

너는 서울 여행 추천 AI이다.

사용자는 ${companion}와 함께 여행할 장소를 찾고 있다.

아래 장소를 평가해라.


장소명:
${place.title}


주소:
${place.addr1}


반드시 JSON만 반환:

{
"contentid":"장소ID",
"score":0~100 숫자,
"reason":"추천 이유"
}

`;




  try{


    const response =
      await client.chat.completions.create({

        model,


        messages:[

          {
            role:"system",

            content:
            "한국 여행 추천 전문가"

          },


          {

            role:"user",

            content:prompt

          }

        ],



        response_format:{

          type:"json_object"

        },



        temperature:0

      });





    const result =
      JSON.parse(

        response
        .choices[0]
        .message
        .content

      );





    return {


      contentid:
        String(
          result.contentid
        ),


      score:
        Number(
          result.score
        ),


      reason:
        result.reason



    };



  }

  catch(error){


    return {


      contentid:
        String(
          place.contentid
          ||
          place.contentId
        ),


      score:50,


      reason:
        "AI 추천 실패"



    };


  }


}







// 최종 추천 함수

export async function recommendPlaces({

  region,

  companion,

  apiKey,

  options={}


}){


  const candidates =
    filterPlaces({

      region,

      companion

    });



  if(
    candidates.length===0
  ){

    return [];

  }



  const targets =
    topN(
      candidates,
      20
    );




  const results=[];




  for(
    const place of targets
  ){



    const score =
      await scorePlaceWithOpenAI(

        place,

        {

          apiKey,

          companion,

          model:
          options.model

        }

      );



    results.push({

      ...place,

      score:
        score.score,


      reason:
        score.reason


    });


  }






  return results

    .sort(

      (a,b)=>
        b.score-a.score

    )

    .slice(0,5);



}