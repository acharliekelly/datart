import React from "react";
import type { GenerationState } from '../utils/types';


const ControlPanel: React.FC<GenerationState> = ({ styleId }) => {
  
  return (
      <form className="control-panel">
        <fieldset>
          <legend>Style:</legend>
          <input id="orbits" value="orbits" type="radio" name="styleId" checked={styleId==='orbits'} />
          <label for="orbits">Orbits</label>
          <input id="strata" value="strata" type="radio" name="styleId" checked={styleId==='strata'} />
          <label for="strata">Strata</label>
          <input id="constellation" value="constellation" type="radio" name="styleId" checked={styleId==='constellation'} />
          <label for="constellation">Constellation</label>
        </fieldset>
        <div className="debug-row">
          <button type="submit">Update</button>
        </div>
      </form>
  )
};

export default ControlPanel;