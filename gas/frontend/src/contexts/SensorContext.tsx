import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/api";

/* ===================== TYPES ===================== */

interface SensorReading {
  id: string;
  roomId: string;
  roomName: string;
  gasType: string;
  level: number;
  unit: string;
  status: "online" | "warning" | "danger" | "offline";
  timestamp: Date;
  threshold: {
    warning: number;
    danger: number;
  };
}

interface ValveStatus {
  valveId: string;
  location: string;
  status: "ON" | "OFF";
  lastUpdated: Date;
}

interface SensorContextType {
  sensors: SensorReading[];
  valves: ValveStatus[];
  setValves: React.Dispatch<React.SetStateAction<ValveStatus[]>>;
  emergencyShutdown: () => void;
}

/* ===================== CONTEXT ===================== */

const SensorContext = createContext<SensorContextType | undefined>(undefined);

/* ===================== INITIAL SENSORS ===================== */

const initialSensors: SensorReading[] = [
  {
    id: "sensor_001",
    roomId: "room_001",
    roomName: "Kitchen",
    gasType: "",
    level: 0,
    unit: "ppm",
    status: "offline",
    timestamp: new Date(),
    threshold: { warning: 50, danger: 100 },
  },
  {
    id: "sensor_002",
    roomId: "room_002",
    roomName: "Living Room",
    gasType: "Carbon Monoxide (CO)",
    level: 0,
    unit: "ppm",
    status: "offline",
    timestamp: new Date(),
    threshold: { warning: 35, danger: 70 },
  },
  {
    id: "sensor_003",
    roomId: "room_003",
    roomName: "Bed Room",
    gasType: "Hydrogen Sulfide (H2S)",
    level: 0,
    unit: "ppm",
    status: "offline",
    timestamp: new Date(),
    threshold: { warning: 10, danger: 20 },
  },
  {
    id: "sensor_004",
    roomId: "room_004",
    roomName: "Boiler Room",
    gasType: "Natural Gas",
    level: 0,
    unit: "ppm",
    status: "offline",
    timestamp: new Date(),
    threshold: { warning: 25, danger: 50 },
  },
];

/* ===================== PROVIDER ===================== */

export const SensorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sensors, setSensors] = useState<SensorReading[]>(initialSensors);
  const [valves, setValves] = useState<ValveStatus[]>([]);

  /* -------- FETCH SENSOR DATA -------- */
  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const res = await api.get("/sensors");

        const updatedSensors = res.data.map((s: any) => ({
          id: s.sensorId,
          roomId: s.roomId,
          roomName: s.name,
          gasType: s.gasType || "",
          level: s.level || 0,
          unit: s.unit || "ppm",
          status:
            s.level >= s.threshold?.danger
              ? "danger"
              : s.level >= s.threshold?.warning
              ? "warning"
              : "online",
          timestamp: new Date(s.timestamp || Date.now()),
          threshold: s.threshold || { warning: 50, danger: 100 },
        }));

        setSensors(updatedSensors);
      } catch (err) {
        console.error("Error fetching sensor data", err);
      }
    };

    fetchSensors();
    const interval = setInterval(fetchSensors, 3000);
    return () => clearInterval(interval);
  }, []);

  /* -------- FETCH VALVES -------- */
  useEffect(() => {
    const fetchValves = async () => {
      try {
        const res = await api.get("/valves");
        setValves(res.data);
      } catch (err) {
        console.error("Error fetching valves", err);
      }
    };

    fetchValves();
  }, []);

  /* -------- EMERGENCY SHUTDOWN (UI SYNC) -------- */
  const emergencyShutdown = () => {
    setValves((prev) =>
      prev.map((v) => ({ ...v, status: "OFF" }))
    );
  };

  return (
    <SensorContext.Provider
      value={{ sensors, valves, setValves, emergencyShutdown }}
    >
      {children}
    </SensorContext.Provider>
  );
};

/* ===================== HOOK ===================== */

export const useSensors = (): SensorContextType => {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error("useSensors must be used within a SensorProvider");
  }
  return context;
};
