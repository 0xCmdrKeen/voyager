import {
  IonBadge,
  IonLabel,
  IonList,
  IonRadio,
  IonRadioGroup,
  IonText,
  IonThumbnail,
} from "@ionic/react";
import { InsetIonItem } from "../shared/formatting";
import styled from "@emotion/styled";
import { useAppDispatch, useAppSelector } from "../../../store";
import { APP_ICONS, AppIcon, updateAppIcon } from "./appIconSlice";
import { isAndroid } from "../../../helpers/device";

const StyledIonThumbnail = styled(IonThumbnail)`
  margin: 1rem 1rem 1rem 0;

  --size: 4.75em;
`;

const Img = styled.img`
  border-radius: 1em;
`;

const H2 = styled.h2`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export default function AppIconComponent() {
  const dispatch = useAppDispatch();
  const icon = useAppSelector((state) => state.appIcon.icon);

  function selectIcon(name: AppIcon) {
    dispatch(updateAppIcon(name));
  }

  return (
    <IonRadioGroup value={icon} onIonChange={(e) => selectIcon(e.detail.value)}>
      <IonList inset>
        {APP_ICONS.map((icon) => (
          <InsetIonItem key={icon}>
            <StyledIonThumbnail slot="start" onClick={() => selectIcon(icon)}>
              <Img src={getIconSrc(icon)} />
            </StyledIonThumbnail>
            <IonLabel>
              <H2>
                {getIconName(icon)}{" "}
                {isIconThemed(icon) && (
                  <IonBadge color="medium">Themed</IonBadge>
                )}
              </H2>
              <p>
                <IonText color="medium">
                  {getIconAuthor(icon)}{" "}
                  {getThemedIconAuthor(icon) &&
                    `— themed by ${getThemedIconAuthor(icon)}`}
                </IonText>
              </p>
            </IonLabel>
            <IonRadio value={icon} />
          </InsetIonItem>
        ))}
      </IonList>
    </IonRadioGroup>
  );
}

export function getIconSrc(icon: AppIcon): string {
  if (icon === "default") return "/logo.png";

  return `/alternateIcons/${icon}.png`;
}

function getIconName(icon: AppIcon): string {
  switch (icon) {
    case "default":
      return "Default";
    case "space":
      return "The Final Frontier";
    case "planetary":
      return "Planetary";
    case "psych":
      return "Psychedelic!";
    case "original":
      return "O.G.";
    case "galactic":
      return "Enter Galactic";
  }
}

function getIconAuthor(icon: AppIcon): string {
  switch (icon) {
    case "default":
    case "planetary":
    case "psych":
      return "fer0n";
    case "space":
      return "ripened_avacado";
    case "original":
      return "nathanielcwm";
    case "galactic":
      return "L1C4U5E";
  }
}

function getThemedIconAuthor(icon: AppIcon): string | undefined {
  if (!isAndroid()) return;

  switch (icon) {
    case "default":
    case "planetary":
      return "Donno";
  }
}

function isIconThemed(icon: AppIcon): boolean {
  if (!isAndroid()) return false;

  switch (icon) {
    case "default":
    case "planetary":
      return true;
    default:
      return false;
  }
}
