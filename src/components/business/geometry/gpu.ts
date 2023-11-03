export function degToRad(d: number) {
  return d * Math.PI / 180;
}

export const createShader = (device: GPUDevice, code: string) => {
  return device.createShaderModule({ code });
}

export const writeBufferData = ({ device, buffer, offset, array }: { device: GPUDevice, buffer: GPUBuffer, offset: number, array: Float32Array }) => {
  device.queue.writeBuffer(buffer, offset, array.buffer, array.byteOffset, array.byteLength);
}