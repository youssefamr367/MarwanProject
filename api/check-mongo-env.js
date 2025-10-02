export default function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  const present = !!process.env.MONGO_URI;
  return res.status(200).send(JSON.stringify({ mongoUriPresent: present }));
}
