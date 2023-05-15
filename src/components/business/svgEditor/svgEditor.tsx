import Container from "./core/container";
import Rect from "./core/rect";
import Text from "./core/text";

export default function SvgEditor() {
  return (
    <div>
      <Container>
        <Rect>
          <Text>svg text</Text>
        </Rect>
      </Container>
    </div>
  )
}