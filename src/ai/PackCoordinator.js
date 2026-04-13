export default class PackCoordinator {
    getSlotDirections(count) {
        const pattern = [-1, 1, -1, 1, 0];
        return Array.from({ length: count }, (_, index) => pattern[index % pattern.length]);
    }
}
