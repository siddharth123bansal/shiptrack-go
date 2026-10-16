export type Status = "in_transit" | "out_for_delivery" | "delivered" | "exception" | "pending";

export interface Shipment {
  id: string;
  tracking: string;
  carrier: string;
  from: string;
  to: string;
  customer: string;
  status: Status;
  eta: string;
  progress: number; // stage index 0-4
  events: { label: string; place: string; time: string }[];
}

export const STAGES = ["Created", "Picked up", "In transit", "Out for delivery", "Delivered"];

export const STATUS_META: Record<Status, { label: string; tone: string }> = {
  in_transit: { label: "In transit", tone: "bg-accent text-accent-foreground" },
  out_for_delivery: { label: "Out for delivery", tone: "bg-primary-soft text-primary" },
  delivered: { label: "Delivered", tone: "bg-success-soft text-success" },
  exception: { label: "Exception", tone: "bg-destructive-soft text-destructive" },
  pending: { label: "Pending", tone: "bg-warning-soft text-warning" },
};

export const SHIPMENTS: Shipment[] = [
  { id: "SHP-24-0918", tracking: "1Z999AA10123456784", carrier: "UPS", from: "SZX", to: "LAX", customer: "Ava Martinez", status: "out_for_delivery", eta: "Today 14:20", progress: 3,
    events: [
      { label: "Out for delivery", place: "Los Angeles, CA", time: "08:12" },
      { label: "Arrived at facility", place: "Ontario, CA", time: "Yesterday 22:40" },
      { label: "Departed origin", place: "Shenzhen, CN", time: "Oct 13 03:15" },
      { label: "Picked up", place: "Shenzhen, CN", time: "Oct 12 17:02" },
    ] },
  { id: "SHP-24-0921", tracking: "9400111899223197428490", carrier: "USPS", from: "NYC", to: "BOS", customer: "Liam Chen", status: "in_transit", eta: "Oct 18", progress: 2,
    events: [
      { label: "In transit", place: "Hartford, CT", time: "06:44" },
      { label: "Picked up", place: "New York, NY", time: "Yesterday 15:30" },
    ] },
  { id: "SHP-24-0925", tracking: "7749 2210 9932", carrier: "FedEx", from: "MEM", to: "DEN", customer: "Noah Patel", status: "exception", eta: "Delayed", progress: 2,
    events: [
      { label: "Weather delay", place: "Memphis, TN", time: "05:10" },
      { label: "Picked up", place: "Memphis, TN", time: "Oct 14 11:00" },
    ] },
  { id: "SHP-24-0902", tracking: "JD014600006281234567", carrier: "DHL", from: "FRA", to: "LHR", customer: "Emma Rossi", status: "delivered", eta: "Delivered Oct 15", progress: 4,
    events: [
      { label: "Delivered · Front door", place: "London, UK", time: "Oct 15 12:31" },
      { label: "Out for delivery", place: "London, UK", time: "Oct 15 07:50" },
    ] },
  { id: "SHP-24-0930", tracking: "BLR8820193", carrier: "Delhivery", from: "BOM", to: "BLR", customer: "Arjun Mehta", status: "pending", eta: "Awaiting pickup", progress: 0,
    events: [{ label: "Label created", place: "Mumbai, IN", time: "Today 09:02" }] },
];
