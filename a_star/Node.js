
Node = function (x, y, parent, action, g, h) {
    var self = {};
    self.x = x;
    self.y = y;
    self.action = action;
    self.parent = parent;
    self.g = g;
    self.h = h;
    return self;
}