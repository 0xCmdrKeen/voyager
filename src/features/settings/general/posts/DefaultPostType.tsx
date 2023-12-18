import { useAppSelector } from "../../../../store";
import { ODefaultPostType } from "../../../../services/db";
import { setDefaultPostType } from "../../settingsSlice";
import SettingSelector from "../../shared/SettingSelector";
import { documentTextOutline, imageOutline, linkOutline } from "ionicons/icons";

export default function DefaultPostType() {
  const defaultPostType = useAppSelector(
    (state) => state.settings.general.posts.type,
  );

  return (
    <SettingSelector
      title="Default Post Type"
      selected={defaultPostType}
      setSelected={setDefaultPostType}
      options={ODefaultPostType}
      optionIcons={{
        [ODefaultPostType.Photo]: imageOutline,
        [ODefaultPostType.Link]: linkOutline,
        [ODefaultPostType.Text]: documentTextOutline,
      }}
    />
  );
}
