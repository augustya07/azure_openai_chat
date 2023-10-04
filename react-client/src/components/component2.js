// import './Tables.css';
// import React, { useState } from "react";
// import { MdKeyboardArrowDown } from "react-icons/md";
// import { HiSquares2X2 } from "react-icons/hi2";
// import { FaList } from "react-icons/fa";
// import { FcFolder } from "react-icons/fc";
// import { BsFileEarmarkPdf } from "react-icons/bs";
// import { PiMicrosoftWordLogoBold } from "react-icons/pi";

// function Table() {
//   return (
//     <div className="header-1">
//       <div className={"head1"}>
//         <p>
//           All files<MdKeyboardArrowDown />
//           <span>
//             <HiSquares2X2 className={"icon2"} /> &ensp;
//             <FaList className={"icon1"} />
//           </span>
//         </p>
//       </div>
//       <table className="custom-table">
//         <thead>
//           <tr className="table-header">
//             <th className="column-name">Name &emsp; &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;|</th> {/* Added spacing between "Name" and "|" */}
//             <th className="column-date"> Date&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;|</th> 
//             <th className="column-type"> Type&emsp;&emsp;&emsp;&emsp;|</th>
//             <th className="column-size"> Size</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td className='column-1'><FcFolder />Market</td>
//             <td>03/09/2023 1:56 PM</td>
//             <td>folder</td>
//             <td>2 files</td>
//           </tr>
//           <tr>
//             <td className='column-1'><FcFolder />legal</td>
//             <td>03/09/2023 1:56 PM</td>
//             <td>folder</td>
//             <td>7 files</td>
//           </tr>
//           <tr>
//             <td className='column-1'><FcFolder />Finance</td>
//             <td>03/09/2023 1:56 PM</td>
//             <td>folder</td>
//             <td>5 files</td>
//           </tr>
//           <tr>
//             <td className='column-1'><FcFolder />Business</td>
//             <td>03/09/2023 1:56 PM</td>
//             <td>folder</td>
//             <td>1 file</td>
//           </tr>
//           <tr>
//             <td className='column-1'><BsFileEarmarkPdf />Agreement</td>
//             <td>03/09/2023 1:56 PM</td>
//             <td>pdf</td>
//             <td>325 kb</td>
//           </tr>
//           <tr>
//             <td className='column-1'><PiMicrosoftWordLogoBold />word</td>
//             <td>03/09/2023 1:56 PM</td>
//             <td>docs</td>
//             <td>325 kb</td>
//           </tr>
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default Table;

// src/components/Table.js
// src/components/Table.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdKeyboardArrowDown } from "react-icons/md";
import { HiSquares2X2 } from "react-icons/hi2";
import { FaList } from "react-icons/fa";
import { FcFolder } from "react-icons/fc";
import { BsFileEarmarkPdf } from "react-icons/bs";
import { PiMicrosoftWordLogoBold } from "react-icons/pi";

import './Tables.css';

function Table() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the API
    axios.get("http://localhost/graph-api")
      .then((response) => {
        setData(response.data.value);
        setIsLoading(false); // Set isLoading to false when data is received
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false); // Set isLoading to false in case of an error
      });
  }, []);

  return (
    <div className="header-1">
      <div className="head1">
        <p>
          All files <MdKeyboardArrowDown />
          <span>
            <HiSquares2X2 className="icon2" /> &ensp;
            <FaList className="icon1" />
          </span>
        </p>
      </div>
      {isLoading ? (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      ) : (
        <table className="custom-table">
          <thead>
            <tr className="table-header">
              <th className="column-name">Name</th>
              <th className="column-date">Date</th>
              <th className="column-type">Type</th>
              <th className="column-size">Size</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <TableRow key={index} item={item} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TableRow({ item }) {
  const { name, lastModifiedDateTime, file, webUrl } = item;

  // Determine the file icon based on the MIME type
  let icon;
  if (file && file.mimeType) {
    if (file.mimeType === "application/pdf") {
      icon = <BsFileEarmarkPdf />;
    } else if (file.mimeType.startsWith("application/vnd.openxmlformats-officedocument.wordprocessingml")) {
      icon = <PiMicrosoftWordLogoBold />;
    } else {
      icon = <FcFolder />;
    }
  } else {
    icon = <FcFolder />;
  }

  const handleFileNameClick = () => {
    // Open the webUrl in a new tab
    window.open(webUrl, "_blank");
  };

  return (
    <tr>
      <td className="column-1" onClick={handleFileNameClick} style={{ cursor: "pointer" }}>
        {icon} {name}
      </td>
      <td>{lastModifiedDateTime}</td>
      <td>{file ? file.mimeType : 'Folder'}</td>
      <td>{file ? `${(file.size / 1024).toFixed(2)} KB` : '-'}</td>
    </tr>
  );
}

export default Table;
