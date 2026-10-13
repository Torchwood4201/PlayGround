import styled from "styled-components";
import { NpcPlacement } from "../maps/map-types";
import PixelImage from "../styles/PixelImage";
import { xToPx, yToPx } from "../app/position-helper";
import { Direction } from "../state/state-types";

interface NpcProps {
  x: number;
  y: number;
}

const StyledNpc = styled.div<NpcProps>`
  position: absolute;
  top: ${(props) => yToPx(props.y)};
  left: ${(props) => xToPx(props.x)};
  transform: translateY(-20%);
`;

const Sprite = styled(PixelImage)`
  width: ${xToPx(1)};
`;

const Npc = ({ npc }: { npc: NpcPlacement }) => {
  const sprite = () => {
    if (npc.facing === Direction.Left) return npc.npc.sprites.left;
    if (npc.facing === Direction.Right) return npc.npc.sprites.right;
    if (npc.facing === Direction.Up) return npc.npc.sprites.up;
    if (npc.facing === Direction.Down) return npc.npc.sprites.down;
    return npc.npc.sprites.down;
  };
  return (
    <StyledNpc x={npc.pos.x} y={npc.pos.y}>
      <Sprite src={sprite()} />
    </StyledNpc>
  );
};

export default Npc;
