import templates from "../../templates/config";

export default function handler(req, res) {
  const list = templates.map(({ id, label, description }) => ({ id, label, description }));
  res.status(200).json(list);
}
