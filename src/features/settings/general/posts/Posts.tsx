import { IonLabel, IonList } from "@ionic/react";
import { InsetIonItem } from "../../../user/Profile";
import { ListHeader } from "../../shared/formatting";
import InfiniteScrolling from "./InfiniteScrolling";
import UpvoteOnSave from "./UpvoteOnSave";
import DefaultSort from "./DefaultSort";
import RememberCommunitySort from "./RememberCommunitySort";
import DefaultPostType from "./DefaultPostType";

export default function Posts() {
  return (
    <>
      <ListHeader>
        <IonLabel>Posts</IonLabel>
      </ListHeader>
      <IonList inset>
        <InsetIonItem routerLink="/settings/general/hiding">
          <IonLabel>Mark Read / Hiding Posts</IonLabel>
        </InsetIonItem>
        <DefaultSort />
        <DefaultPostType />
        <RememberCommunitySort />
        <InfiniteScrolling />
        <UpvoteOnSave />
      </IonList>
    </>
  );
}
