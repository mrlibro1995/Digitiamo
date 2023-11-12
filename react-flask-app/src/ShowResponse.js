import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./ShowResponse.css"
import "./charts.css"
import CopyButton from './copy_button';

function ShowResponse() {
  const { data } = useParams();
  const [response_html, setResponse_html] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // showing Loading ... before getting Performance Data


  useEffect(() => {
    sendDataToBackend();
  }, []); 

  const sendDataToBackend = async () => {
    try {
      setIsLoading(true);
      let response = await fetch('/show_response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (response.ok) {
        response = await response.json();
        console.log(response);
        setResponse_html(response.data);
        
        let performanceResponse = await fetch('/api/performance', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: response.data.Request.url}),
         });
  
        if (performanceResponse.ok) {
         
          performanceResponse = await performanceResponse.json();
          console.log('Performance Data:', performanceResponse);
  
          // Performance Data is called to get after getting Request and Responses data, in this why I am accelerating the 
          // page loading and only performance section would be incompleted for a small delay tii the performance data get ready 
          setPerformanceData(performanceResponse);
         }
       
      } else {
        console.error('Error sending data to the backend');
      }
    } catch (error) {
      console.error('Error sending data to the backend', error);
    } finally {
      // Set loading to false when data is fetched (or even if there's an error)
      setIsLoading(false);
    }
  };

  return (
    <div>
    <div className="dashboard">
      <div className="profile">
        <h2>HTTP Request-Response Analyser!</h2>
        {response_html && (
          <> 
          <h2>Response Status: {response_html.Responses[response_html.Responses.length - 1][0].split(' ', 3)[1]}</h2>
          <h2>{response_html.Responses[response_html.Responses.length - 1][0].split(' ', 3)[2]}</h2>
          </>
        )}
        {response_html && (
        <CopyButton textToCopy={ response_html.PageURL} />
        )}
      </div>

      <div className="request-table">
        <h2>Request Details</h2>
        {response_html && (
          
        <ul>
          <li>URL: {response_html.Request.url}</li>
          <li>Method: {response_html.Request.method}</li>
          <li>Domain: {response_html.Request.domain}</li>
          <li>Scheme: {response_html.Request.scheme}</li>
          <li>Path: {response_html.Request.path}</li>
        </ul>
        )} 
      </div>
            
      {response_html && response_html.Responses && response_html.Responses.length > 0 && (
        <>
          {response_html.Responses.map((response, index) => (
            <div id={index} className="response-table">
              <h2>Response Details</h2>
              <table>
                <tr>
                  <td>Status Line:</td>
                  <td>{response[0]}</td>
                </tr>
                <tr>
                  <td>Location:</td>
                  <td>{response[1]}</td>
                </tr>
                <tr>
                  <td>Server:</td>
                  <td>{response[2]}</td>
                </tr>
                <tr>
                  <td>Date:</td>
                  <td>{response[3]}</td>
                </tr>
              </table>
            </div>
          ))}
        </>
      )}
  
      <div className="performance_div">
        <h2>Performance</h2>
        {isLoading ? (<div className="loading-icon">Loading...</div>):(
          <table className="table table-borderless">
          <tr>
            <td className="graphs">
            <div className="svg-item">
                <svg width="100%" height="100%" viewBox="0 0 40 40" className="donut">
                  <circle className="donut-hole" cx="20" cy="20" r="15.91549430918954" fill="#202631"></circle>
                  <circle className="donut-ring" cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke-width="3.5"></circle>
                  <circle className="donut-segment donut-segment-2" cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke-width="3.5" stroke-dasharray={`${performanceData.scaled_fcp} ${100-performanceData.scaled_fcp}` } stroke-dashoffset="25"></circle>
                  <g className="donut-text donut-text-1">
                  <text y="50%" transform="translate(0, 2)">
                    <tspan x="50%" text-anchor="middle" className="donut-percent">{performanceData.fcp}</tspan>   
                  </text>
                  <text y="60%" transform="translate(0, 2)">
                      <tspan x="50%" text-anchor="middle" className="donut-data">ms</tspan>   
                    </text>
                  </g>
                </svg>
              </div>
              <p>FIRST CONTENTFUL PAINT</p>
            </td>
            <td className="graphs">
            <div class="svg-item">
                <svg width="100%" height="100%" viewBox="0 0 40 40" className="donut">
                  <circle className="donut-hole" cx="20" cy="20" r="15.91549430918954" fill="#202631"></circle>
                  <circle className="donut-ring" cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke-width="3.5"></circle>
                  <circle className="donut-segment donut-segment-2" cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke-width="3.5" stroke-dasharray={`${performanceData.scaled_fid} ${100-performanceData.scaled_fid}` } stroke-dashoffset="25"></circle>
                  <g className="donut-text donut-text-1">
                    <text y="50%" transform="translate(0, 2)">
                      <tspan x="50%" text-anchor="middle" class="donut-percent">{performanceData.fid}</tspan>   
                    </text>
                    <text y="60%" transform="translate(0, 2)">
                      <tspan x="50%" text-anchor="middle" class="donut-data">ms</tspan>   
                    </text>
                  </g>
                </svg>
              </div>
              <p>FIRST INPUT DELAY</p>
            </td>
            <td className="graphs">
            <div className="svg-item">
                <svg width="100%" height="100%" viewBox="0 0 40 40" class="donut">
                  <circle className="donut-hole" cx="20" cy="20" r="15.91549430918954" fill="#202631"></circle>
                  <circle className="donut-ring" cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke-width="3.5"></circle>
                  <circle className="donut-segment donut-segment-2" cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke-width="3.5" stroke-dasharray={`${performanceData.scaled_cls} ${100-performanceData.scaled_cls}` } stroke-dashoffset="25"></circle>
                  <g className="donut-text donut-text-1">
                    <text y="50%" transform="translate(0, 2)">
                      <tspan x="50%" text-anchor="middle" class="donut-percent">{performanceData.clss}</tspan>   
                    </text>
                    <text y="60%" transform="translate(0, 2)">
                      <tspan x="50%" text-anchor="middle" class="donut-data"></tspan>   
                    </text>
                  </g>
                </svg>
              </div>
              <p>CUMULATIVE LAYOUT SHIFT</p>
            </td>
            <td className="graphs">
            <div class="svg-item">
                <svg width="100%" height="100%" viewBox="0 0 40 40" class="donut">
                  <circle class="donut-hole" cx="20" cy="20" r="15.91549430918954" fill="#202631"></circle>
                  <circle class="donut-ring" cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke-width="3.5"></circle>
                  <circle class="donut-segment donut-segment-2" cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke-width="3.5" stroke-dasharray={`${performanceData.scaled_lcp} ${100-performanceData.scaled_lcp}` } stroke-dashoffset="25"></circle>
                  <g class="donut-text donut-text-1">
                    <text y="50%" transform="translate(0, 2)">
                      <tspan x="50%" text-anchor="middle" class="donut-percent">{performanceData.lcp}</tspan>   
                    </text>
                    <text y="60%" transform="translate(0, 2)">
                      <tspan x="50%" text-anchor="middle" class="donut-data">ms</tspan>   
                    </text>
                  </g>
                </svg>
              </div>
              <p>LARGEST CONTENTFUL PAINT</p>
            </td>
          </tr>
        </table>
        )}
      </div> 
    </div>
  </div>
  );
}

export default ShowResponse;