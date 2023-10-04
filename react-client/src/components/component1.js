import './Contents.css';
import React, { useState } from "react";
import { AiFillFile } from "react-icons/ai";

import { AiOutlineClockCircle } from "react-icons/ai";
import { FiTrash } from "react-icons/fi";
import { BiSolidPlusCircle } from "react-icons/bi";
import { AiFillFolder } from "react-icons/ai";
import { IoIosArrowForward } from "react-icons/io";
import {AiOutlineFile} from "react-icons/ai";
import {CgNotes} from "react-icons/cg";

function Contents() {
  const [showContents, setShowContents] = useState(false);

  const toggleContents = () => {
    setShowContents(!showContents);
  };

  return (
    <div className="des">
      <h2>LOGO</h2><br/>
      <AiFillFile /> &ensp;All Files<br /><br />
      <CgNotes />&ensp;Notes<br /><br />
      <AiOutlineClockCircle />&ensp;Recent<br /><br />
      <FiTrash />&ensp;Trash<br /><br />
      My Collections&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;<BiSolidPlusCircle />
      <p onClick={toggleContents} className="mainfolder">
        <AiFillFolder />&ensp;Folder 1&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;<IoIosArrowForward className={showContents ? "down" : ""} />
      </p>
      <div className={`subfolder ${showContents ? "open" : ""}`}>
        <AiOutlineFile/>&ensp;Sub Folder<br />
        <AiOutlineFile/>&ensp;Sub Folder<br />
        <AiOutlineFile/>&ensp;Sub Folder<br />
        <AiOutlineFile/>&ensp;Sub Folder<br />
      </div>
    </div>
  );
}

export default Contents;
