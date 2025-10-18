import mongoose from "mongoose";

const valveSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomId: { type: String },
  isOpen: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
  lastOperation: { type: Date, default: Date.now }
});

export const Valve = mongoose.model("Valve", valveSchema);
