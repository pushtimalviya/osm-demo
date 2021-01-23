import React from "react";
import { MapExample } from "../component/mapComponent"


const data =  [
    [
        [
          21.616579336740603,
          77.12016769252767
        ],
        [
          22.268764039073968,
          78.48223569073234
        ],
        [
          19.642587534013032,
          79.27311388323828
        ],
        [
          18.8543103618898,
          76.68079091891325
        ]
      ]
  ];


class MapControl extends React.Component {

    constructor (props) {
        this.state = {
            layer: props.polyCoordinates
        }
    }

    render(){
       return <MapExample data={data} ></MapExample> 
    }
}

export default MapControl