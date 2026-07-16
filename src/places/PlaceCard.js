import tour from '../data/서울_관광지.json';
import culture from '../data/서울_문화시설.json';
import sports from '../data/서울_레포츠.json';


const normalize = (data) => {

  if (!data) return [];


  if (Array.isArray(data)) {

    return data;

  }


  if (Array.isArray(data.items)) {

    return data.items;

  }


  if (
    data.response &&
    data.response.body &&
    data.response.body.items &&
    Array.isArray(data.response.body.items.item)
  ) {

    return data.response.body.items.item;

  }


  return [];

};



export const allPlaces = [

  ...normalize(tour),

  ...normalize(culture),

  ...normalize(sports)

];





export function getPlaceByContentId(contentId) {


  if(contentId == null){

    return null;

  }


  const id =
    String(contentId);



  return allPlaces.find(place => {


    return String(

      place.contentid
      ||
      place.contentId
      ||
      place.id
      ||
      ""

    ) === id;


  }) || null;


}