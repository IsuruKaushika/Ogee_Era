import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

// Loads the shop settings for the admin pages and saves the sections you changed.
export const useSiteSettings = (token) => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .post(backendUrl + "/api/settings/admin/get", {}, { headers: { token } })
      .then(({ data }) => (data.success ? setSettings(data.settings) : toast.error(data.message || "Could not load settings")))
      .catch((e) => toast.error(e.message));
  }, [token]);

  const patch = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  const save = async (keys) => {
    setSaving(true);
    try {
      const body = Object.fromEntries(keys.map((k) => [k, settings[k]]));
      const { data } = await axios.post(backendUrl + "/api/settings/admin/update", body, { headers: { token } });
      if (data.success) {
        setSettings(data.settings);
        toast.success("Saved. The website updates within about 30 seconds.");
      } else toast.error(data.message || "Could not save");
    } catch (e) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  return { settings, patch, save, saving };
};

export const uploadImage = async (token, file) => {
  const form = new FormData();
  form.append("image", file);
  const { data } = await axios.post(backendUrl + "/api/settings/admin/upload", form, { headers: { token } });
  if (!data.success) throw new Error(data.message || "Upload failed");
  return data.url;
};
