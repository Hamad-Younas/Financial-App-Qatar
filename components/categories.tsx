"use client"

import { useEffect } from "react";

const Categories = () => {
    useEffect(() => {
        console.log("Categories component mounted");

        console.log("this is window",window)

    const getAllLookups = async () => {
        const query = `SELECT value FROM lookups`;
       
        const response = await window.electronAPI.dbQuery(query, []);
        return response;
      };
     getAllLookups().then((response) => {
        console.log("Response:", response);
      }
    )
    .catch((error) => {
        console.error("Error:", error);
      }
    );
    }
    , []);
  return (
    <div>Categories</div>
  )
}

export default Categories