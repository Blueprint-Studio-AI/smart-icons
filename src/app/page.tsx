'use client';

import { useState, useRef } from 'react';
import Head from 'next/head';

type BCDStatus = "On" | "Disabled" | "Disconnected";
type BCDVerdict = "Ok" | "Unsure" | "Fake" | null;
type EventType = "Age > 21" | "Age > 21 and Expired" | "Age < 21" | "Age < 21 and Expired" | "Idle";
type IconType = "tobacco" | "cards" | "slots" | "marijuana" | "alcohol" | "vape" | "age";

interface TableRow {
  id: number;
  event: EventType;
  bcdStatus: BCDStatus;
  bcdVerdict: BCDVerdict;
  age: number;
  icon1Type: IconType;
  icon2Type: IconType;
  imageUrl: string;
}

// Generate all valid combinations
const generateTableData = (): TableRow[] => {
  const events: EventType[] = ["Age > 21", "Age > 21 and Expired", "Age < 21", "Age < 21 and Expired"];
  const bcdStatuses: BCDStatus[] = ["On", "Disabled", "Disconnected"];
  const bcdVerdicts: BCDVerdict[] = ["Ok", "Unsure", "Fake"];
  const iconTypes: IconType[] = ["tobacco", "cards", "slots", "marijuana", "alcohol", "vape", "age"];
  
  const data: TableRow[] = [];
  let id = 1;
  
  // Add 3 Idle event rows first (at top of table)
  ["On", "Disabled", "Disconnected"].forEach(status => {
    data.push({
      id: id++,
      event: "Idle",
      bcdStatus: status as BCDStatus,
      bcdVerdict: null,
      age: 0, // Age 0 for Idle
      icon1Type: iconTypes[Math.floor(Math.random() * iconTypes.length)],
      icon2Type: iconTypes[Math.floor(Math.random() * iconTypes.length)],
      imageUrl: `/sample${id - 1}.jpg`
    });
  });
  
  events.forEach(event => {
    bcdStatuses.forEach(bcdStatus => {
      if (bcdStatus === "On") {
        // When BCD Status is "On", include all possible verdicts
        bcdVerdicts.forEach(bcdVerdict => {
          data.push({
            id: id++,
            event,
            bcdStatus,
            bcdVerdict,
            age: event.includes("< 21") ? 19 + Math.floor(Math.random() * 2) : 21 + Math.floor(Math.random() * 10),
            icon1Type: iconTypes[Math.floor(Math.random() * iconTypes.length)],
            icon2Type: iconTypes[Math.floor(Math.random() * iconTypes.length)],
            imageUrl: `/sample${id - 1}.jpg`
          });
        });
      } else {
        // When BCD Status is "Disabled" or "Disconnected", verdict must be null
        data.push({
          id: id++,
          event,
          bcdStatus,
          bcdVerdict: null,
          age: event.includes("< 21") ? 19 + Math.floor(Math.random() * 2) : 21 + Math.floor(Math.random() * 10),
          icon1Type: iconTypes[Math.floor(Math.random() * iconTypes.length)],
          icon2Type: iconTypes[Math.floor(Math.random() * iconTypes.length)],
          imageUrl: `/sample${id - 1}.jpg`
        });
      }
    });
  });
  
  return data;
};

const sampleData: TableRow[] = generateTableData();

export default function Home() {
  const [selectedRow, setSelectedRow] = useState<TableRow | null>({
    id: 1,
    event: "Idle",
    bcdStatus: "On",
    bcdVerdict: null,
    age: 0,
    icon1Type: "alcohol",
    icon2Type: "tobacco",
    imageUrl: "/sample1.jpg"
  });
  const [icon1Override, setIcon1Override] = useState<IconType>("alcohol");
  const [icon2Override, setIcon2Override] = useState<IconType>("tobacco");
  const [showExportWarning, setShowExportWarning] = useState(false);
  
  const iconTypes: IconType[] = ["tobacco", "cards", "slots", "marijuana", "alcohol", "vape", "age"];
  
  // Ref for the image display area
  const imageDisplayRef = useRef<HTMLDivElement>(null);

  // Function to export the image display area
  const exportImageDisplay = async () => {
    if (!imageDisplayRef.current) return;

    // Show warning after first click
    setShowExportWarning(true);

    try {
      // Try using dom-to-image as an alternative to html2canvas
      const domtoimage = (await import('dom-to-image')).default;
      
      const dataUrl = await domtoimage.toPng(imageDisplayRef.current, {
        quality: 1,
        bgcolor: '#ffffff',
        width: 300 * 2,
        height: 533 * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left'
        }
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `smart-icons-${selectedRow?.event?.replace(/[^a-zA-Z0-9]/g, '-') || 'display'}-${Date.now()}.png`;
      link.href = dataUrl;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('dom-to-image failed, trying html2canvas fallback:', error);
      
      // Fallback to html2canvas with minimal options
      try {
        const html2canvas = (await import('html2canvas')).default;
        
        const canvas = await html2canvas(imageDisplayRef.current, {
          backgroundColor: '#ffffff',
          scale: 1, // Reduced scale to avoid issues
          logging: false,
          useCORS: false,
          allowTaint: false
        });
        
        // Create download link
        const link = document.createElement('a');
        link.download = `smart-icons-${selectedRow?.event?.replace(/[^a-zA-Z0-9]/g, '-') || 'display'}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error('Both export methods failed:', fallbackError);
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
        alert(`Export failed: ${errorMessage}. This may be due to browser compatibility issues.`);
      }
    }
  };

  // Function to get icon variant based on rules
  const getIconVariant = (selectedRow: TableRow | null): string => {
    if (!selectedRow) return "_idle";
    
    // If Event is "Idle", always use "_idle" variant
    if (selectedRow.event === "Idle") return "_idle";
    
    // Age rule takes priority: if age < 21, always use "_x"
    if (selectedRow.age < 21) return "_x";
    
    // If age >= 21, then check BCD Verdict if BCD Status is "On"
    if (selectedRow.bcdStatus === "On" && selectedRow.bcdVerdict) {
      if (selectedRow.bcdVerdict === "Fake") return "_x";
      if (selectedRow.bcdVerdict === "Unsure") return "_unsure";
      if (selectedRow.bcdVerdict === "Ok") return "_ok";
    }
    
    // Default for age >= 21 when no verdict or BCD Status is not "On"
    return "_ok";
  };

  // Function to get BCD icon
  const getBCDIcon = (selectedRow: TableRow | null): string => {
    if (!selectedRow) return "icon_BCD_ok.png";
    
    // If Event is "Idle", use appropriate idle variant based on BCD Status
    if (selectedRow.event === "Idle") {
      if (selectedRow.bcdStatus === "Disabled") return "icon_BCD_disabled.png";
      if (selectedRow.bcdStatus === "Disconnected") return "icon_BCD_disconnected.png";
      if (selectedRow.bcdStatus === "On") return "icon_BCD_idle.png";
    }
    
    if (selectedRow.bcdStatus === "Disabled") return "icon_BCD_disabled.png";
    if (selectedRow.bcdStatus === "Disconnected") return "icon_BCD_disconnected.png";
    if (selectedRow.bcdStatus === "On" && selectedRow.bcdVerdict === "Fake") return "icon_BCD_fake.png";
    if (selectedRow.bcdStatus === "On" && selectedRow.bcdVerdict === "Unsure") return "icon_BCD_unsure.png";
    
    return "icon_BCD_ok.png";
  };

  // Function to get text overlay background color
  const getTextOverlayBgColor = (selectedRow: TableRow | null): string => {
    if (!selectedRow) return "#6EE5B8";
    
    // If Event is "Idle", return white
    if (selectedRow.event === "Idle") return "#FFFFFF";
    
    // Age < 21 takes priority
    if (selectedRow.age < 21) return "#FF8484";
    
    // BCD Verdict "Fake" takes priority over expired
    if (selectedRow.bcdVerdict === "Fake") return "#FF8484";
    
    // When Age > 21 and Expired (but not Fake), return yellow
    if (selectedRow.age >= 21 && selectedRow.event.includes("Expired")) return "#FCFF52";
    
    // Then check other BCD verdicts
    if (selectedRow.bcdVerdict === "Unsure") return "#FCFF52";
    if (selectedRow.bcdVerdict === "Ok") return "#6EE5B8";
    
    // Default for age >= 21 with no verdict
    return "#6EE5B8";
  };

  // Function to get Large Text
  const getLargeText = (selectedRow: TableRow | null): string => {
    if (!selectedRow) return "Large Text";
    
    // If Event is "Idle"
    if (selectedRow.event === "Idle") return "Ready to Scan";
    
    // When BCD Verdict is "Fake"
    if (selectedRow.bcdVerdict === "Fake") return "Alert! Tap Here for Info";
    
    // When Age < 21 (takes priority over BCD Status conditions)
    if (selectedRow.age < 21) return "Under Age";
    
    // When Age > 21 and Expired and BCD Verdict is "Unsure"
    if (selectedRow.age >= 21 && selectedRow.event.includes("Expired") && selectedRow.bcdVerdict === "Unsure") return "Format Unrecognized";
    
    // When Age > 21 and Expired (other verdicts)
    if (selectedRow.age >= 21 && selectedRow.event.includes("Expired")) return "ID Expired";
    
    // When Age > 21 and BCD Verdict is "Ok"
    if (selectedRow.age >= 21 && selectedRow.bcdVerdict === "Ok") return "ID OK";
    
    // When Age > 21 and BCD Verdict is "Unsure"
    if (selectedRow.age >= 21 && selectedRow.bcdVerdict === "Unsure") return "Unrecognized Format";
    
    // When BCD Status is Disabled or Disconnected (only for age >= 21 now)
    if (selectedRow.bcdStatus === "Disabled" || selectedRow.bcdStatus === "Disconnected") {
      return "Age OK";
    }
    
    // Add more conditions here as needed
    return "Large Text";
  };

  // Function to get Small Text - returns null to disable, string to show
  const getSmallText = (selectedRow: TableRow | null): string | null => {
    if (!selectedRow) return "Small Text";
    
    // If Event is "Idle", disable small text
    if (selectedRow.event === "Idle") return null;
    
    // When BCD Verdict is "Fake", disable small text
    if (selectedRow.bcdVerdict === "Fake") return null;
    
    // When Age > 21 and Expired and BCD Verdict is "Unsure"
    if (selectedRow.age >= 21 && selectedRow.event.includes("Expired") && selectedRow.bcdVerdict === "Unsure") return "and ID Expired";
    
    // When Age > 21 and Expired (other verdicts), disable small text
    if (selectedRow.age >= 21 && selectedRow.event.includes("Expired")) return null;
    
    // When Age > 21 and BCD Verdict is "Ok"
    if (selectedRow.age >= 21 && selectedRow.bcdVerdict === "Ok") return "ID Format & Age OK";
    
    // When Age > 21 and BCD Verdict is "Unsure"
    if (selectedRow.age >= 21 && selectedRow.bcdVerdict === "Unsure") return "Tap Here for Info";
    
    // When Age < 21 and BCD Verdict is "Ok", disable small text
    if (selectedRow.age < 21 && selectedRow.bcdVerdict === "Ok") return null;
    
    // When Age < 21 and BCD Verdict is "Unsure"
    if (selectedRow.age < 21 && selectedRow.bcdVerdict === "Unsure") {
      const baseText = "Unrecognized Format";
      const isExpired = selectedRow.event.includes("Expired");
      return isExpired ? baseText + " and ID Expired" : baseText;
    }
    
    // When BCD Status is Disabled
    if (selectedRow.bcdStatus === "Disabled") return "BCD DISABLED";
    
    // When BCD Status is Disconnected
    if (selectedRow.bcdStatus === "Disconnected") return "BCD OFF";
    
    // Add more conditions here as needed
    return "Small Text";
  };

  return (
    <>
      <div className="flex h-screen">
        {/* Left Panel - Table */}
        <div className="w-1/2 p-3 border-r bg-white">
          <h1 className="text-lg font-medium mb-3 text-gray-800">TokenWorks Smart Icons Refresh</h1>
          <div className="overflow-auto">
            <table className="w-full border-collapse bg-white text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-1.5 px-2.5 text-left font-medium text-gray-700 text-xs">Event</th>
                  <th className="py-1.5 px-2.5 text-left font-medium text-gray-700 text-xs">BCD Status</th>
                  <th className="py-1.5 px-2.5 text-left font-medium text-gray-700 text-xs">BCD Verdict</th>
                </tr>
              </thead>
              <tbody>
                {sampleData.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-blue-50 cursor-pointer transition-colors duration-150 border-b border-gray-100 ${
                      selectedRow?.id === row.id ? 'bg-blue-100' : ''
                    }`}
                    onMouseEnter={() => {
                      setSelectedRow(row);
                      // Don't reset icon overrides when hovering over different rows
                    }}
                  >
                    <td className="py-1.5 px-2.5 text-gray-800 text-sm">{row.event}</td>
                    <td className="py-1.5 px-2.5">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        row.bcdStatus === 'On' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {row.bcdStatus}
                      </span>
                    </td>
                    <td className="py-1.5 px-2.5">
                      {row.bcdVerdict ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          row.bcdVerdict === 'Ok' ? 'bg-green-100 text-green-800' :
                          row.bcdVerdict === 'Unsure' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {row.bcdVerdict}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Right Panel - Image Display */}
      <div className="w-1/2 p-3 bg-gray-50 flex flex-col">
        {/* Data summary at top */}
        {selectedRow ? (
          <div className="p-2 bg-white rounded border text-xs mb-3">
            <h3 className="font-medium text-gray-800 mb-1">Current Selection</h3>
            <div className="grid grid-cols-2 gap-1 mb-2">
              <div><span className="text-gray-500">Event:</span> {selectedRow.event}</div>
              <div><span className="text-gray-500">Age:</span> {selectedRow.age}</div>
              <div><span className="text-gray-500">Status:</span> {selectedRow.bcdStatus}</div>
              <div><span className="text-gray-500">Verdict:</span> {selectedRow.bcdVerdict || 'None'}</div>
              <div className="flex flex-row gap-2">
                  <label className="block text-xs text-gray-500">Icon1:</label>
                  <select 
                    className="w-full text-xs border rounded px-1 py-1 max-w-[100px]"
                    value={icon1Override}
                    onChange={(e) => setIcon1Override(e.target.value as IconType)}
                  >
                    {iconTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-row gap-2">
                  <label className="block text-xs text-gray-500">Icon2:</label>
                  <select 
                    className="w-full text-xs border rounded px-1 py-1 max-w-[100px]"
                    value={icon2Override}
                    onChange={(e) => setIcon2Override(e.target.value as IconType)}
                  >
                    {iconTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
            </div>
          </div>
        ) : (
          <div className="p-2 bg-white rounded border text-xs mb-3 text-center text-gray-500">
            <p>Hover over a row to display details</p>
          </div>
        )}
        
        {/* Image display area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {selectedRow ? (
            <>
              <div 
                ref={imageDisplayRef}
                className="w-[300px] h-[533px] bg-white border border-gray-200 rounded shadow relative overflow-hidden"
              >
                {/* Background image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: 'url(/background.png)' }}
                />
                
                {/* Icon slots row - 489px from top (scaled to 204px for 300px width) */}
                <div 
                  className="absolute w-full flex flex-row gap-2 px-2"
                  style={{ top: '204px' }}
                >
                  {/* Icon 1 */}
                  <div className="w-[71px] h-[71px] relative">
                    <img 
                      src={`/icons/icon_${icon1Override}${getIconVariant(selectedRow)}.png`}
                      alt={`Icon 1: ${icon1Override}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Icon 2 */}
                  <div className="w-[71px] h-[71px] relative">
                    <img 
                      src={`/icons/icon_${icon2Override}${getIconVariant(selectedRow)}.png`}
                      alt={`Icon 2: ${icon2Override}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Age Background Icon */}
                  <div className="w-[71px] h-[71px] relative flex items-center justify-center">
                    <img 
                      src={`/icons/bg_age${getIconVariant(selectedRow)}.png`}
                      alt="Age background"
                      className="w-full h-full object-contain absolute inset-0"
                    />
                    <p 
                      className="relative z-10 text-4xl mt-[3]"
                      style={{
                        color: getIconVariant(selectedRow) === '_idle' ? '#9A9A9A' :
                               getIconVariant(selectedRow) === '_ok' ? '#F4FFFB' :
                               getIconVariant(selectedRow) === '_unsure' ? '#786D01' :
                               '#FFF4F4'
                      }}
                    >
                      {selectedRow?.bcdVerdict === "Fake" ? "0" : selectedRow?.age}
                    </p>
                  </div>
                  
                  {/* BCD Icon */}
                  <div className="w-[71px] h-[71px] relative">
                    <img 
                      src={`/icons/${getBCDIcon(selectedRow)}`}
                      alt="BCD status"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                {/* Text overlay area - 667px from top (scaled to 278px for 300px width) */}
                <div 
                  className={`absolute w-full h-[42px] flex flex-col items-center ${
                    getSmallText(selectedRow) ? 'justify-center gap-0.5' : 'justify-center'
                  }`}
                  style={{ 
                    top: '278px',
                    backgroundColor: getTextOverlayBgColor(selectedRow)
                  }}
                >
                  <p className="text-black text-[18px] leading-none">{getLargeText(selectedRow)}</p>
                  {getSmallText(selectedRow) && (
                    <p className="text-black text-[12px] leading-none">{getSmallText(selectedRow)}</p>
                  )}
                </div>
              </div>
              
              {/* Export button below image */}
              <button
                onClick={exportImageDisplay}
                className="mt-6 px-3 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
              >
                Export Image
              </button>
              
              {/* Warning note that appears after first export click */}
              {showExportWarning && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 max-w-[300px] text-center">
                  <p>If image is incomplete, try exporting again.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center mb-2 mx-auto">
                <span className="text-lg">👆</span>
              </div>
              <p className="text-sm font-medium mb-1">Hover over a row</p>
              <p className="text-xs">720 × 1280 display</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}