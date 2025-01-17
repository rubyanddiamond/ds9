import {
  homeOutline,
  libraryOutline,
  listOutline,
  peopleOutline,
  pinOutline,
} from "ionicons/icons";
import { ODefaultFeedType } from "../../../../services/db";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { updateDefaultFeed } from "../../settingsSlice";
import SettingSelector from "../../shared/SettingSelector";
import { jwtSelector } from "../../../auth/authSlice";
import { useIonModal } from "@ionic/react";
import CommunitySelectorModal from "../../../shared/CommunitySelectorModal";
import { CommunityView } from "lemmy-js-client";
import { useContext } from "react";
import { PageContext } from "../../../auth/PageContext";
import { getHandle } from "../../../../helpers/lemmy";

export default function DefaultFeed() {
  const dispatch = useAppDispatch();
  const defaultFeed = useAppSelector(
    (state) => state.settings.general.defaultFeed,
  );
  const jwt = useAppSelector(jwtSelector);
  const { pageRef } = useContext(PageContext);

  const [presentCommunitySelectorModal, onDismiss] = useIonModal(
    CommunitySelectorModal,
    {
      onDismiss: (data?: CommunityView) => {
        if (data) {
          dispatch(
            updateDefaultFeed({
              type: ODefaultFeedType.Community,
              name: getHandle(data.community),
            }),
          );
        }

        onDismiss(data);
      },
      pageRef,
    },
  );

  if (!jwt || !defaultFeed) return; // must be logged in to configure default feed

  return (
    <SettingSelector
      title="Default Feed"
      selected={defaultFeed.type}
      setSelected={(type) => {
        if (type === ODefaultFeedType.Community) {
          presentCommunitySelectorModal({ cssClass: "small" });

          return () => {}; // nothing to dispatch
        }

        return updateDefaultFeed({ type });
      }}
      options={ODefaultFeedType}
      optionIcons={{
        [ODefaultFeedType.Home]: homeOutline,
        [ODefaultFeedType.All]: libraryOutline,
        [ODefaultFeedType.Local]: peopleOutline,
        [ODefaultFeedType.CommunityList]: listOutline,
        [ODefaultFeedType.Community]: pinOutline,
      }}
      getSelectedLabel={(option) => {
        if (option === ODefaultFeedType.CommunityList) return "List";
        if (option === ODefaultFeedType.Community)
          // TODO SettingSelector should handle being passed a non-string item
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return `c/${(defaultFeed as any).name}`;
      }}
    />
  );
}
