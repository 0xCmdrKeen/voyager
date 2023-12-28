import { styled } from "@linaria/react";
import { IonIcon, useIonActionSheet } from "@ionic/react";
import {
  ellipsisHorizontal,
  peopleOutline,
  personOutline,
} from "ionicons/icons";
import { ModlogItemType } from "../../../routes/pages/shared/ModlogPage";
import { getHandle } from "../../../helpers/lemmy";
import useAppNavigation from "../../../helpers/useAppNavigation";
import { notEmpty } from "../../../helpers/array";
import useIsAdmin from "../useIsAdmin";
import { getModIcon } from "../useCanModerate";

const EllipsisIcon = styled(IonIcon)`
  font-size: 1.2rem;
`;

interface ModlogItemMoreActions {
  item: ModlogItemType;
}

export default function ModlogItemMoreActions({ item }: ModlogItemMoreActions) {
  const { navigateToCommunity, navigateToUser } = useAppNavigation();
  const [presentActionSheet] = useIonActionSheet();

  const community = "community" in item ? item.community : undefined;

  const person = (() => {
    if ("commenter" in item) return item.commenter;
    if ("banned_person" in item) return item.banned_person;
    if ("modded_person" in item) return item.modded_person;
  })();

  const moderator = (() => {
    if ("moderator" in item) return item.moderator;
    if ("admin" in item) return item.admin;
  })();

  const isAdmin = useIsAdmin(moderator);

  const role = (() => {
    if (moderator && isAdmin) return "admin-local";
    if ("admin" in item) return "admin-remote";
    return "mod";
  })();

  function presentMoreActions() {
    presentActionSheet({
      cssClass: "left-align-buttons",
      buttons: [
        person
          ? {
              text: getHandle(person),
              icon: personOutline,
              handler: () => {
                navigateToUser(person);
              },
            }
          : undefined,
        community
          ? {
              text: getHandle(community),
              icon: peopleOutline,
              handler: () => {
                navigateToCommunity(community);
              },
            }
          : undefined,
        moderator
          ? {
              text: getHandle(moderator),
              icon: getModIcon(role),
              cssClass: role,
              handler: () => {
                navigateToUser(moderator);
              },
            }
          : undefined,
        {
          text: "Cancel",
          role: "cancel",
        },
      ].filter(notEmpty),
    });
  }

  return (
    <EllipsisIcon
      icon={ellipsisHorizontal}
      onClick={(e) => {
        e.stopPropagation();
        presentMoreActions();
      }}
    />
  );
}
