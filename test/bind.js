

var expect = chai.expect;

describe( 'BindAll', function() {

    var base = null;

    beforeEach( function() {
        test.createBase();
        base = document.querySelector( 'urban-base' );
    });

    afterEach( function() {
        test.removeBase();
        base = null;
    });

    it( 'Expects a bind all function to exist on the base element', function() {
        expect( base.bindAll ).to.exist;
    });

    it( 'Expects bind all to bind the context of functions called', function( done ) {
        base.addEventListener( 'testEvent', function( event ) {
            this.addedProp = 'prop';
            base.fire( 'onComplete' );
        });

        base.addEventListener( 'onComplete', function( event ) {
            expect( base.addedProp ).to.equal( 'prop' );
            done();
        });

        base.fire( 'testEvent' );
    });
});
